'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';
import { useCurrentUser } from '@/lib/current-user';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

type MatchRequest = { id: string; person?: { name?: string; initial?: string } };

export default function AutoMatchRequestNotice({ enabled = true }: { enabled?: boolean }) {
  const { user, ready } = useCurrentUser();
  const [request, setRequest] = useState<MatchRequest | null>(null);
  const [decision, setDecision] = useState<'accept' | 'decline' | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || !ready || !user) return;
    let active = true;
    async function poll() {
      const token = await getAccessToken({ redirectOnFailure: false });
      if (!token || !active) return;
      const response = await fetch(`${api}/api/v1/connections/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok || !active) return;
      const body = await response.json();
      const next = (Array.isArray(body.requests) ? body.requests : []).find((item: { id?: string; source?: string; status?: string }) => item.source === 'public_room' && item.status === 'pending' && item.id && !seen.current.has(item.id));
      if (next?.id) {
        seen.current.add(next.id);
        setRequest(next);
      }
    }
    void poll();
    const interval = window.setInterval(() => void poll(), 8000);
    return () => { active = false; window.clearInterval(interval); };
  }, [enabled, ready, user]);

  async function decide(nextDecision: 'accept' | 'decline') {
    if (!request) return;
    const token = await getAccessToken({ redirectOnFailure: false });
    if (!token) return;
    setDecision(nextDecision);
    const response = await fetch(`${api}/api/v1/connections/${request.id}/${nextDecision}/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) {
      const accepted = nextDecision === 'accept';
      setRequest(null);
      if (accepted) window.location.assign('/connections');
    }
    setDecision(null);
  }

  if (!request) return null;

  return <aside className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-md rounded-[24px] bg-dark-950 p-5 text-white shadow-[0_18px_50px_rgba(40,29,50,.3)] md:bottom-5 md:right-5 md:left-auto" role="dialog" aria-label="Auto-match request"><button type="button" onClick={() => setRequest(null)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close match request"><X className="h-4 w-4" /></button><div className="flex items-start gap-3 pr-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-spark-coral"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-bold">Someone is open to continuing.</p><p className="mt-1 text-xs leading-5 text-white/65">{request.person?.name ?? 'A room participant'} would like to connect after your shared experience.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" disabled={Boolean(decision)} onClick={() => void decide('decline')} className="rounded-full border border-white/20 px-3 py-2.5 text-xs font-bold text-white/75 disabled:opacity-50">{decision === 'decline' ? 'Declining…' : 'Not now'}</button><button type="button" disabled={Boolean(decision)} onClick={() => void decide('accept')} className="rounded-full bg-spark-coral px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">{decision === 'accept' ? 'Opening…' : 'Continue'}</button></div></aside>;
}
