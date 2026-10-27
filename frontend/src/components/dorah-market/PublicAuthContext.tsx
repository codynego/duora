'use client';

import { createContext, useContext } from 'react';
import { useCurrentUser, type CurrentUser } from '@/lib/current-user';

type PublicAuthState = { user: CurrentUser | null; ready: boolean };
const PublicAuthContext = createContext<PublicAuthState | null>(null);

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useCurrentUser();
  return <PublicAuthContext.Provider value={{ user, ready }}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const state = useContext(PublicAuthContext);
  if (!state) throw new Error('PublicAuthProvider is missing from the public site layout.');
  return state;
}
