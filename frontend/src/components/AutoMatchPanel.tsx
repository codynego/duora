'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function AutoMatchPanel() {
  const [state, setState] = useState<'idle' | 'loading' | 'waiting' | 'matched' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function startMatching() {
    const token = await getAccessToken();
    if (!token) return;
    setState('loading');
    setMessage('');
    try {
      const response = await fetch(`${api}/api/v1/discovery/auto-match/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail ?? 'Auto-match is unavailable right now.');
      if (body.data?.status === 'matched') {
        setState('matched');
        setMessage(`A request is on its way${body.data.shared_interest ? ` because you both like ${body.data.shared_interest}` : ''}. They can choose whether to continue.`);
      } else if (body.data?.status === 'waiting') {
        setState('waiting');
        setMessage('You’re in the queue. We’ll let you know when someone with a shared interest is available.');
      } else {
        throw new Error(body.data?.reason ?? 'Add your interests before using Auto-match.');
      }
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Auto-match is unavailable right now.');
    }
  }

  async function stopMatching() {
    const token = await getAccessToken({ redirectOnFailure: false });
    if (token) await fetch(`${api}/api/v1/discovery/auto-match/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setState('idle');
    setMessage('');
  }

  const waiting = state === 'waiting';
  return <section className="relative overflow-hidden rounded-[28px] bg-dark-950 p-7 text-white shadow-[0_20px_50px_rgba(40,29,50,.14)] sm:p-9">
    <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-spark-coral/25 blur-2xl" aria-hidden="true" />
    <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
      <div className="max-w-xl">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-spark-rose"><Sparkles className="h-5 w-5" /></span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-spark-rose">Find someone now</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-.06em] sm:text-4xl">Meet through what you both like.</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">Auto-match looks at your saved interests and intent, then sends a private request. Nothing becomes a connection unless they choose to continue too.</p>
      </div>
      <div className="shrink-0">
        {waiting ? <button type="button" onClick={() => void stopMatching()} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Leave queue</button> : <button type="button" disabled={state === 'loading'} onClick={() => void startMatching()} className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(240,90,120,.25)] hover:bg-spark-flame disabled:opacity-60">{state === 'loading' ? 'Finding someone…' : 'Auto-match me'}<ArrowRight className="h-4 w-4" /></button>}
      </div>
    </div>
    {message && <p className="relative mt-6 max-w-2xl rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-white/80" role="status">{message}</p>}
  </section>;
}
