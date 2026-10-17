import { GameQuestion, GameType, Player, RelationshipStage, RoomState, RoundResult } from '../../../shared/types.js';
import { getQuestionsForGame } from '../content/questions.js';

interface InternalRoom extends RoomState {
  questions: GameQuestion[];
  revealTimeout?: NodeJS.Timeout;
}

export class RoomManager {
  private rooms: Map<string, InternalRoom> = new Map();
  // Matchmaking queue: vibe -> socketId array
  private matchmakingQueues: Map<string, { socketId: string; nickname: string; avatar: string }[]> = new Map();

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(hostSocketId: string, nickname: string, avatar: string, gameType: GameType, stage: RelationshipStage): RoomState {
    const roomCode = this.generateRoomCode();
    const questions = getQuestionsForGame(gameType, stage, 5);

    const hostPlayer: Player = {
      id: hostSocketId,
      nickname: nickname || 'Host',
      avatar: avatar || '🔥',
      isHost: true,
      isReady: false,
      score: 0
    };

    const room: InternalRoom = {
      roomCode,
      gameType,
      stage,
      status: 'lobby',
      hostId: hostSocketId,
      players: { [hostSocketId]: hostPlayer },
      currentRound: 0,
      totalRounds: questions.length,
      currentQuestion: null,
      roundTimerSeconds: 30,
      roundTimeRemaining: 30,
      roundResults: [],
      chemistryScore: 0,
      vibeTag: 'Calculating...',
      questions
    };

    this.rooms.set(roomCode, room);
    return this.getPublicState(room);
  }

  joinRoom(roomCode: string, socketId: string, nickname: string, avatar: string): RoomState | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    // Check player count (max 2 for couple/flirt 1-on-1, or allow rejoining)
    const existingPlayer = room.players[socketId];
    if (!existingPlayer && Object.keys(room.players).length >= 2) {
      // Room full
      return null;
    }

    if (!existingPlayer) {
      room.players[socketId] = {
        id: socketId,
        nickname: nickname || 'Player 2',
        avatar: avatar || '✨',
        isHost: false,
        isReady: false,
        score: 0
      };
    }

    return this.getPublicState(room);
  }

  setPlayerReady(roomCode: string, socketId: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.players[socketId]) return null;

    room.players[socketId].isReady = true;
    return this.getPublicState(room);
  }

  startGame(roomCode: string, socketId: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostId !== socketId) return null;

    room.status = 'question';
    room.currentRound = 1;
    room.currentQuestion = room.questions[0] || null;
    room.roundTimeRemaining = room.roundTimerSeconds;

    // Reset player answers
    Object.values(room.players).forEach(p => {
      p.currentAnswer = null;
      p.currentPrediction = null;
    });

    return this.getPublicState(room);
  }

  submitAnswer(roomCode: string, socketId: string, answer: string, prediction?: string): { state: RoomState; bothAnswered: boolean } | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.players[socketId]) return null;

    const player = room.players[socketId];
    player.currentAnswer = answer;
    if (prediction) {
      player.currentPrediction = prediction;
    }

    const playerList = Object.values(room.players);
    const bothAnswered = playerList.length >= 2 && playerList.every(p => p.currentAnswer !== null && p.currentAnswer !== undefined);

    if (bothAnswered) {
      // Transition to revealing
      room.status = 'revealing';
      this.evaluateRound(room);
    }

    return { state: this.getPublicState(room), bothAnswered };
  }

  private evaluateRound(room: InternalRoom) {
    const players = Object.values(room.players);
    if (players.length < 2 || !room.currentQuestion) return;

    const [p1, p2] = players;
    const p1Answer = p1.currentAnswer || '';
    const p2Answer = p2.currentAnswer || '';

    let isMatch = false;
    let commentary = '';

    if (room.gameType === 'predict-me') {
      // Prediction mode: check if p1 guessed p2's answer, and p2 guessed p1's
      const p1GuessedRight = p1.currentPrediction === p2Answer;
      const p2GuessedRight = p2.currentPrediction === p1Answer;

      if (p1GuessedRight && p2GuessedRight) {
        p1.score += 20;
        p2.score += 20;
        isMatch = true;
        commentary = `🎯 Double bullseye! You both read each other's minds completely!`;
      } else if (p1GuessedRight) {
        p1.score += 20;
        isMatch = true;
        commentary = `🧠 ${p1.nickname} knows ${p2.nickname} better than they expected!`;
      } else if (p2GuessedRight) {
        p2.score += 20;
        isMatch = true;
        commentary = `🧠 ${p2.nickname} predicted ${p1.nickname} flawlessly!`;
      } else {
        commentary = `🙈 Total mystery! Neither guessed what the other would choose.`;
      }
    } else {
      // This or that & standard dilemma match
      isMatch = p1Answer === p2Answer;
      if (isMatch) {
        p1.score += 15;
        p2.score += 15;
        commentary = `🔥 In sync! Both picked "${this.getOptionLabel(room.currentQuestion, p1Answer)}"!`;
      } else {
        commentary = `⚡ Playful friction! ${p1.nickname} picked "${this.getOptionLabel(room.currentQuestion, p1Answer)}", while ${p2.nickname} went with "${this.getOptionLabel(room.currentQuestion, p2Answer)}".`;
      }
    }

    const result: RoundResult = {
      questionId: room.currentQuestion.id,
      prompt: room.currentQuestion.prompt,
      playerAnswers: {
        [p1.id]: p1Answer,
        [p2.id]: p2Answer
      },
      playerPredictions: {
        [p1.id]: p1.currentPrediction || '',
        [p2.id]: p2.currentPrediction || ''
      },
      isMatch,
      banterCommentary: commentary
    };

    room.roundResults.push(result);
  }

  nextRound(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.currentRound >= room.totalRounds) {
      // Game Over
      room.status = 'game_over';
      this.calculateFinalChemistry(room);
      return this.getPublicState(room);
    }

    room.currentRound += 1;
    room.currentQuestion = room.questions[room.currentRound - 1] || null;
    room.status = 'question';
    room.roundTimeRemaining = room.roundTimerSeconds;

    // Reset player answers for next round
    Object.values(room.players).forEach(p => {
      p.currentAnswer = null;
      p.currentPrediction = null;
    });

    return this.getPublicState(room);
  }

  rematch(roomCode: string, newGameType?: GameType): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const gameType = newGameType || room.gameType;
    room.gameType = gameType;
    room.questions = getQuestionsForGame(gameType, room.stage, 5);
    room.totalRounds = room.questions.length;
    room.currentRound = 0;
    room.roundResults = [];
    room.currentQuestion = null;
    room.status = 'lobby';

    Object.values(room.players).forEach(p => {
      p.score = 0;
      p.isReady = false;
      p.currentAnswer = null;
      p.currentPrediction = null;
    });

    return this.getPublicState(room);
  }

  private calculateFinalChemistry(room: InternalRoom) {
    const matches = room.roundResults.filter(r => r.isMatch).length;
    const ratio = room.roundResults.length > 0 ? matches / room.roundResults.length : 0.5;

    // Scale to percentage (minimum baseline of 45% for fun ego boost)
    const score = Math.round(45 + ratio * 50);
    room.chemistryScore = Math.min(score, 99);

    if (room.chemistryScore >= 85) {
      room.vibeTag = '⚡ Telepathic Soulmates';
    } else if (room.chemistryScore >= 70) {
      room.vibeTag = '🔥 Dangerously Flirty';
    } else if (room.chemistryScore >= 55) {
      room.vibeTag = '💥 Delicious Friction & Banter';
    } else {
      room.vibeTag = '🎭 Chaotic Opposites Attract';
    }
  }

  private getOptionLabel(question: GameQuestion, optionId: string): string {
    const opt = question.options?.find(o => o.id === optionId);
    return opt ? opt.label : optionId;
  }

  // --- Matchmaking Queue for Discover Vibe Roulette ---
  enqueueMatchmaking(vibe: string, socketId: string, nickname: string, avatar: string): { paired: boolean; roomCode?: string; otherSocketId?: string } {
    let queue = this.matchmakingQueues.get(vibe);
    if (!queue) {
      queue = [];
      this.matchmakingQueues.set(vibe, queue);
    }

    // Filter out if already in queue
    const filtered = queue.filter(item => item.socketId !== socketId);
    this.matchmakingQueues.set(vibe, filtered);

    if (filtered.length > 0) {
      // Match found!
      const partner = filtered.shift()!;
      // Create room with This or That or Predict Me
      const roomState = this.createRoom(partner.socketId, partner.nickname, partner.avatar, 'this-or-that', 'single');
      this.joinRoom(roomState.roomCode, socketId, nickname, avatar);

      return {
        paired: true,
        roomCode: roomState.roomCode,
        otherSocketId: partner.socketId
      };
    } else {
      // Add to queue
      filtered.push({ socketId, nickname, avatar });
      this.matchmakingQueues.set(vibe, filtered);
      return { paired: false };
    }
  }

  leaveMatchmaking(socketId: string) {
    this.matchmakingQueues.forEach((queue, vibe) => {
      this.matchmakingQueues.set(vibe, queue.filter(item => item.socketId !== socketId));
    });
  }

  removePlayer(socketId: string): { roomCode: string; state: RoomState | null } | null {
    this.leaveMatchmaking(socketId);
    for (const [code, room] of this.rooms.entries()) {
      if (room.players[socketId]) {
        delete room.players[socketId];
        if (Object.keys(room.players).length === 0) {
          this.rooms.delete(code);
          return { roomCode: code, state: null };
        }
        return { roomCode: code, state: this.getPublicState(room) };
      }
    }
    return null;
  }

  getRoom(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    return room ? this.getPublicState(room) : null;
  }

  private getPublicState(room: InternalRoom): RoomState {
    const { revealTimeout, questions, ...publicState } = room;
    return publicState;
  }
}
