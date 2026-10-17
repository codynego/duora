import { Router } from 'express';
import type { RoomManager } from '../rooms/RoomManager.js';

export function createRoomsRouter(roomManager: RoomManager) {
  const router = Router();
  router.get('/:roomCode', (request, response) => {
    const roomCode = request.params.roomCode;
    if (!/^[A-HJ-NP-Z2-9]{5}$/i.test(roomCode)) return response.status(400).json({ error: { code: 'INVALID_ROOM_CODE', message: 'Room code format is invalid.' } });
    const room = roomManager.getRoom(roomCode);
    if (!room) return response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Room not found or expired.' } });
    response.json({ data: room });
  });
  return router;
}
