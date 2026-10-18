'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

type RoomEvent = { id?: string; event: string; payload?: Record<string, unknown>; user_id?: number };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export function useRoomActivity(roomId: string, enabled = true) {
  const [events, setEvents] = useState<RoomEvent[]>([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let disposed = false;
    async function refresh() {
      const token = await getAccessToken();
      if (disposed || !enabled || !roomId || !token) return;
      const response = await fetch(`${api}/api/v1/rooms/${roomId}/activity/`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!disposed && response.ok) { setEvents(body.data ?? []); setSynced(true); }
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 4000);
    return () => { disposed = true; window.clearInterval(interval); };
  }, [enabled, roomId]);

  const send = useCallback(async (event: string, payload: Record<string, unknown> = {}) => {
    const token = await getAccessToken();
    if (!token || !roomId) return;
    const response = await fetch(`${api}/api/v1/rooms/${roomId}/activity/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ event, payload }) });
    const body = await response.json();
    if (response.ok && body.data) setEvents((current) => [...current.filter((item) => item.id !== body.data.id), body.data].slice(-100));
  }, [roomId]);

  return { connected: synced, events, send };
}
