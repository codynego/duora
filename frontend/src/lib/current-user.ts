'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

export type CurrentUser = {
  id: number | string;
  username: string;
  display_name: string;
  email: string;
  date_joined: string;
};

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
let cachedUser: CurrentUser | null = null;
let cachedAt = 0;
let currentUserRequest: Promise<CurrentUser | null> | null = null;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (cachedUser && Date.now() - cachedAt < 5 * 60_000) return cachedUser;
  if (currentUserRequest) return currentUserRequest;
  currentUserRequest = (async () => {
    const token = await getAccessToken({ redirectOnFailure: false });
    if (!token) return null;
    const response = await fetch(`${api}/api/v1/auth/me/`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return null;
    const body = await response.json();
    const user = body.data ?? null;
    if (user) {
      cachedUser = user;
      cachedAt = Date.now();
    }
    return user;
  })().finally(() => {
    currentUserRequest = null;
  });
  return currentUserRequest;
}

export function clearCurrentUserCache() {
  cachedUser = null;
  cachedAt = 0;
}

export async function updateCurrentUser(input: { username?: string; display_name?: string }) {
  const token = await getAccessToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`${api}/api/v1/auth/me/`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.detail ?? Object.values(payload ?? {}).flat().join(' ');
    throw new Error(typeof detail === 'string' && detail ? detail : 'Could not save your profile.');
  }
  return payload.data as CurrentUser;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((value) => {
      setUser(value);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      clearCurrentUserCache();
      setUser(null);
    };
    window.addEventListener('dorah:auth-changed', handleAuthChange);
    return () => window.removeEventListener('dorah:auth-changed', handleAuthChange);
  }, []);

  return { user, ready, setUser };
}
