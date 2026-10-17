export type RelationshipStage = 'single' | 'talking' | 'together';

export type GameType =
  | 'this-or-that'       // Quick romantic/spicy dilemmas
  | 'predict-me'         // Predict the other's answer
  | 'truth-or-dare'       // Escalating comfort challenges
  | 'choose-your-move'   // Interactive banter & flirt scenarios
  | 'deep-dive';         // Meaningful relationship questions

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
  spicyScore?: number;
}

export interface GameQuestion {
  id: string;
  gameType: GameType;
  prompt: string;
  options?: QuestionOption[];
  stage?: RelationshipStage[];
  category?: string;
  intensityLevel: 1 | 2 | 3; // 1 = Icebreaker/Fun, 2 = Flirt/Values, 3 = Spicy/Deep
  predictPrompt?: string; // e.g. "What will [Partner] choose?"
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  currentAnswer?: string | null;
  currentPrediction?: string | null;
}

export type RoomStatus =
  | 'lobby'             // Waiting for players
  | 'starting'          // Countdown to start
  | 'question'          // Question active, players submitting
  | 'revealing'         // Answers locked, revealing side-by-side
  | 'round_summary'     // Points & banter highlight for the round
  | 'game_over';        // Final Chemistry Score, viral card, rematch

export interface RoundResult {
  questionId: string;
  prompt: string;
  playerAnswers: Record<string, string>; // playerId -> answer
  playerPredictions?: Record<string, string>; // playerId -> predicted partner answer
  isMatch: boolean;
  banterCommentary: string; // Fun automated quip about their match or clash
}

export interface RoomState {
  roomCode: string;
  gameType: GameType;
  stage: RelationshipStage;
  status: RoomStatus;
  hostId: string;
  players: Record<string, Player>;
  currentRound: number;
  totalRounds: number;
  currentQuestion?: GameQuestion | null;
  roundTimerSeconds: number;
  roundTimeRemaining: number;
  roundResults: RoundResult[];
  chemistryScore: number; // 0 - 100%
  vibeTag: string; // e.g., "Chaotic Soulmates", "Passionate Debate", "Unstoppable Flirts"
}

// Socket Events
export interface ClientToServerEvents {
  'room:create': (data: { nickname: string; avatar: string; gameType: GameType; stage: RelationshipStage }) => void;
  'room:join': (data: { roomCode: string; nickname: string; avatar: string }) => void;
  'room:ready': (data: { roomCode: string }) => void;
  'room:start': (data: { roomCode: string }) => void;
  'answer:submit': (data: { roomCode: string; answer: string; prediction?: string }) => void;
  'round:next': (data: { roomCode: string }) => void;
  'room:rematch': (data: { roomCode: string; gameType?: GameType }) => void;
  'matchmaking:join': (data: { nickname: string; avatar: string; vibe: string }) => void;
  'matchmaking:leave': () => void;
  'chat:send': (data: { roomCode: string; message: string }) => void;
}

export interface ServerToClientEvents {
  'room:updated': (state: RoomState) => void;
  'room:error': (data: { message: string }) => void;
  'matchmaking:paired': (data: { roomCode: string }) => void;
  'chat:message': (data: { senderId: string; nickname: string; message: string; timestamp: number }) => void;
}
