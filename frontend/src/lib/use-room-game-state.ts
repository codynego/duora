'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export function useRoomGameState<T extends Record<string, unknown>>(roomId: string, enabled: boolean, initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const writeInFlight = useRef(false);

  const refresh = useCallback(async () => {
    // Never replace an optimistic interaction with a poll that began before
    // the server had saved it. This is especially visible on choice screens.
    if (writeInFlight.current) return;
    const token = await getAccessToken();
    if (!token || !roomId || !enabled) return;
    const response = await fetch(`${api}/api/v1/rooms/${roomId}/game-state/`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    if (response.ok && body.data && Object.keys(body.data).length) setState(body.data as T);
  }, [enabled, roomId]);

  useEffect(() => {
    void refresh();
    if (!enabled || !roomId) return;
    const interval = window.setInterval(() => void refresh(), 750);
    return () => window.clearInterval(interval);
  }, [enabled, refresh, roomId]);

  const update = useCallback(async (next: T) => {
    writeInFlight.current = true;
    setState(next);
    const token = await getAccessToken();
    if (!token || !roomId) { writeInFlight.current = false; return; }
    try {
      const response = await fetch(`${api}/api/v1/rooms/${roomId}/game-state/`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ state: next }) });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.data) setState(body.data as T);
    } finally {
      writeInFlight.current = false;
    }
  }, [roomId]);

  return { state, update };
}
