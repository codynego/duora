import type { Socket } from 'socket.io';

export function applySocketRateLimit(socket: Socket, limit = 40, windowMs = 10_000) {
  let count = 0;
  let windowStarted = Date.now();
  socket.use(([_event, ..._args], next) => {
    const now = Date.now();
    if (now - windowStarted >= windowMs) { count = 0; windowStarted = now; }
    count += 1;
    if (count > limit) return next(new Error('RATE_LIMITED'));
    next();
  });
}
