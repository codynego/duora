import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './rooms/RoomManager.js';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types.js';
import { loadConfig } from './config/env.js';
import { authenticateSocket, optionalActor, requireActor } from './security/auth.js';
import { corsOptions, createRateLimiter, securityHeaders } from './security/http.js';
import { createRoomsRouter } from './api/rooms.js';
import { applySocketRateLimit } from './realtime/limits.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const config = loadConfig();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors(corsOptions(config)));
app.use(express.json({ limit: '16kb', type: 'application/json' }));
app.use(createRateLimiter(120, 60_000));
app.use(optionalActor(config));

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: corsOptions(config),
  maxHttpBufferSize: 16_384,
  transports: ['websocket', 'polling'],
});

const roomManager = new RoomManager();

// --- REST Endpoints ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Duora Connection Server', timestamp: Date.now() });
});

app.use('/v1/rooms', requireActor(), createRoomsRouter(roomManager));

app.get('/api/games', (req, res) => {
  res.json({
    stages: [
      { id: 'single', title: 'Discover', subtitle: 'Singles, crush games & banter practice', icon: '💘' },
      { id: 'talking', title: 'Connect', subtitle: 'Talking stage, first dates & compatibility', icon: '💬' },
      { id: 'together', title: 'Together', subtitle: 'Couples, date-night challenges & intimacy', icon: '✨' }
    ],
    games: [
      {
        id: 'predict-me',
        title: 'Predict Me',
        tagline: 'Guess what they will choose before they answer',
        stages: ['single', 'talking', 'together'],
        rounds: 5,
        icon: '🔮',
        badge: 'Top Viral'
      },
      {
        id: 'this-or-that',
        title: 'This or That',
        tagline: 'Fast romantic & lifestyle dilemmas',
        stages: ['single', 'talking', 'together'],
        rounds: 5,
        icon: '⚡',
        badge: 'Fast & Fun'
      },
      {
        id: 'truth-or-dare',
        title: 'Truth or Dare: Spark Edition',
        tagline: 'Playful confessions & spicy voice dares',
        stages: ['talking', 'together'],
        rounds: 5,
        icon: '🔥',
        badge: 'Spicy'
      },
      {
        id: 'choose-your-move',
        title: 'Choose Your Move',
        tagline: 'Interactive flirting scenarios & date moves',
        stages: ['single', 'talking'],
        rounds: 5,
        icon: '🎭',
        badge: 'Flirt Mode'
      }
    ]
  });
});

// --- Socket.io Handlers ---
io.use((socket, next) => authenticateSocket(socket, config, next));
io.on('connection', (socket) => {
  applySocketRateLimit(socket);
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create Room
  socket.on('room:create', ({ nickname, avatar, gameType, stage }) => {
    try {
      const room = roomManager.createRoom(socket.id, nickname, avatar, gameType, stage);
      socket.join(room.roomCode);
      socket.emit('room:updated', room);
      console.log(`[Room Created] ${room.roomCode} by ${nickname} (${socket.id})`);
    } catch (err: any) {
      socket.emit('room:error', { message: err.message || 'Failed to create room' });
    }
  });

  // Join Room
  socket.on('room:join', ({ roomCode, nickname, avatar }) => {
    const code = roomCode.toUpperCase().trim();
    const room = roomManager.joinRoom(code, socket.id, nickname, avatar);
    if (!room) {
      return socket.emit('room:error', { message: 'Invalid room code or room is already full' });
    }
    socket.join(code);
    io.to(code).emit('room:updated', room);
    console.log(`[Room Joined] ${nickname} joined ${code}`);
  });

  // Ready Player
  socket.on('room:ready', ({ roomCode }) => {
    const room = roomManager.setPlayerReady(roomCode, socket.id);
    if (room) {
      io.to(roomCode).emit('room:updated', room);
    }
  });

  // Start Game
  socket.on('room:start', ({ roomCode }) => {
    const room = roomManager.startGame(roomCode, socket.id);
    if (room) {
      io.to(roomCode).emit('room:updated', room);
      console.log(`[Game Started] Room ${roomCode}`);
    }
  });

  // Submit Answer
  socket.on('answer:submit', ({ roomCode, answer, prediction }) => {
    const result = roomManager.submitAnswer(roomCode, socket.id, answer, prediction);
    if (result) {
      io.to(roomCode).emit('room:updated', result.state);

      // If both answered, auto advance to next question after 4 seconds of reveal
      if (result.bothAnswered) {
        setTimeout(() => {
          const updated = roomManager.nextRound(roomCode);
          if (updated) {
            io.to(roomCode).emit('room:updated', updated);
          }
        }, 4500);
      }
    }
  });

  // Advance to next round manually
  socket.on('round:next', ({ roomCode }) => {
    const room = roomManager.nextRound(roomCode);
    if (room) {
      io.to(roomCode).emit('room:updated', room);
    }
  });

  // Rematch
  socket.on('room:rematch', ({ roomCode, gameType }) => {
    const room = roomManager.rematch(roomCode, gameType);
    if (room) {
      io.to(roomCode).emit('room:updated', room);
      console.log(`[Rematch Triggered] Room ${roomCode}`);
    }
  });

  // Matchmaking (Discover Roulette)
  socket.on('matchmaking:join', ({ nickname, avatar, vibe }) => {
    const match = roomManager.enqueueMatchmaking(vibe || 'spontaneous', socket.id, nickname, avatar);
    if (match.paired && match.roomCode && match.otherSocketId) {
      const room = roomManager.getRoom(match.roomCode);
      if (room) {
        socket.join(match.roomCode);
        const otherSocket = io.sockets.sockets.get(match.otherSocketId);
        if (otherSocket) {
          otherSocket.join(match.roomCode);
        }
        io.to(match.roomCode).emit('matchmaking:paired', { roomCode: match.roomCode });
        io.to(match.roomCode).emit('room:updated', room);
      }
    }
  });

  socket.on('matchmaking:leave', () => {
    roomManager.leaveMatchmaking(socket.id);
  });

  // Post-Game Ephemeral Chat
  socket.on('chat:send', ({ roomCode, message }) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.players[socket.id]) {
      const player = room.players[socket.id];
      io.to(roomCode).emit('chat:message', {
        senderId: socket.id,
        nickname: player.nickname,
        message,
        timestamp: Date.now()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const res = roomManager.removePlayer(socket.id);
    if (res && res.state) {
      io.to(res.roomCode).emit('room:updated', res.state);
    }
  });
});

httpServer.listen(config.port, () => {
  console.log(`Duora backend listening on http://localhost:${config.port}`);
});
