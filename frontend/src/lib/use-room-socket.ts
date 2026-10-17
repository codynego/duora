'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

type RoomEvent = { event: string; payload?: Record<string, unknown>; user_id?: number };

export function useRoomSocket(roomId: string, enabled = true) {
  const socket = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<RoomEvent[]>([]);

  useEffect(() => {
    let connection: WebSocket | null = null;
    let disposed = false;
    async function connect() {
      const token = await getAccessToken();
      if (disposed || !enabled || !token || !roomId) return;
      const base = (process.env.NEXT_PUBLIC_DUORA_WS_URL ?? 'ws://127.0.0.1:8000').replace(/\/$/, '');
      connection = new WebSocket(`${base}/ws/rooms/${roomId}/`, ['bearer', token]);
      socket.current = connection;
      connection.onopen = () => { setConnected(true); connection?.send(JSON.stringify({ event: 'room.ready', payload: {} })); };
      connection.onclose = () => setConnected(false);
      connection.onmessage = (message) => {
        try { setEvents((current) => [...current.slice(-29), JSON.parse(message.data) as RoomEvent]); } catch { /* ignore invalid room traffic */ }
      };
    }
    void connect();
    return () => { disposed = true; connection?.close(); };
  }, [enabled, roomId]);

  const send = useCallback((event: string, payload: Record<string, unknown> = {}) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ event, payload }));
  }, []);

  return { connected, events, send };
}
