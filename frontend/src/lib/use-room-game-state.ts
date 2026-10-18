'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export function useRoomGameState<T extends Record<string, unknown>>(roomId: string, enabled: boolean, initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const refresh = useCallback(async () => {
    const token = await getAccessToken();
    if (!token || !roomId || !enabled) return;
    const response = await fetch(`${api}/api/v1/rooms/${roomId}/game-state/`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    if (response.ok && body.data && Object.keys(body.data).length) setState(body.data as T);
  }, [enabled, roomId]);

  useEffect(() => {
    void refresh();
    if (!enabled || !roomId) return;
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(interval);
  }, [enabled, refresh, roomId]);

  const update = useCallback(async (next: T) => {
    setState(next);
    const token = await getAccessToken();
    if (!token || !roomId) return;
    await fetch(`${api}/api/v1/rooms/${roomId}/game-state/`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ state: next }) });
  }, [roomId]);

  return { state, update };
}
