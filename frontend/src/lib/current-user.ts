'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

export type CurrentUser = {
  id: number | string;
  username: string;
  display_name: string;
  anonymous_username: string;
  anonymous_display_name: string;
  email: string;
  date_joined: string;
};

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getAccessToken({ redirectOnFailure: false });
  if (!token) return null;
  const response = await fetch(`${api}/api/v1/auth/me/`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const body = await response.json();
  return body.data ?? null;
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

  return { user, ready, setUser };
}
