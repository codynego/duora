'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, LoaderCircle, Sparkles, X } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

type MatchState = 'idle' | 'loading' | 'waiting' | 'matched' | 'error';
type MatchResult = { thread_id?: string; shared_interest?: string };

export default function AutoMatchPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<MatchState>('idle');
  const [message, setMessage] = useState('');
  const [match, setMatch] = useState<MatchResult | null>(null);

  function showMatch(result: MatchResult) {
    setMatch(result);
    setState('matched');
    setMessage(result.shared_interest ? 'You both like ' + result.shared_interest + '. Say hello, then decide what feels right.' : 'You found someone. Say hello, then decide what feels right.');
    if (result.thread_id) router.push('/connections/' + result.thread_id);
  }

  async function getStatus() {
    const token = await getAccessToken({ redirectOnFailure: false });
    if (!token) return;
    const response = await fetch(api + '/api/v1/discovery/auto-match/', { headers: { Authorization: 'Bearer ' + token } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return;
    if (body.data?.status === 'matched' && body.data.thread_id) {
      showMatch(body.data);
    }
  }

  useEffect(() => {
    if (state !== 'waiting') return;
    const interval = window.setInterval(() => void getStatus(), 3000);
    return () => window.clearInterval(interval);
  }, [state]);

  async function startMatching() {
    const token = await getAccessToken();
    if (!token) return;
    setState('loading');
    setMessage('');
    try {
      const response = await fetch(api + '/api/v1/discovery/auto-match/', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail ?? 'Auto-match is unavailable right now.');
      if (body.data?.status === 'matched') {
        showMatch(body.data);
      } else if (body.data?.status === 'waiting') {
        setState('waiting');
        setMessage('We’re looking for someone with a shared interest. You can leave the search at any time.');
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
    if (token) await fetch(api + '/api/v1/discovery/auto-match/', { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    setState('idle');
    setMessage('');
    setMatch(null);
  }

  function openChat() {
    if (match?.thread_id) router.push('/connections/' + match.thread_id);
  }

  const searching = state === 'loading' || state === 'waiting';
  return <>
    <section className="relative overflow-hidden rounded-[28px] bg-dark-950 p-7 text-white shadow-[0_20px_50px_rgba(40,29,50,.14)] sm:p-9">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-spark-coral/25 blur-2xl" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-spark-rose"><Sparkles className="h-5 w-5" /></span>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-spark-rose">Find someone now</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-.06em] sm:text-4xl">Meet through what you both like.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">Search by saved interests and intent, then open a private chat before either of you decides what happens next.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(240,90,120,.25)] hover:bg-spark-flame">{searching ? 'View search' : state === 'matched' ? 'Open match' : 'Auto-match me'}<ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>

    {open && <div className="fixed inset-0 z-[80] bg-dark-950/55 backdrop-blur-md sm:grid sm:place-items-center sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="auto-match-title" className="relative flex h-full w-full flex-col overflow-hidden bg-[#fffdfc] text-dark-950 sm:h-auto sm:min-h-[420px] sm:w-[min(460px,calc(100vw-3rem))] sm:rounded-[30px] sm:shadow-2xl">
        <button type="button" onClick={() => setOpen(false)} className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-dark-950/5 text-dark-950/60 hover:bg-dark-950/10 hover:text-dark-950" aria-label="Close auto-match"><X className="h-4 w-4" /></button>
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-7 py-14 sm:px-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#fff0f3]" aria-hidden="true" />
          <div className="relative">
            <span className={'grid h-14 w-14 place-items-center rounded-2xl ' + (searching ? 'bg-dark-950 text-spark-rose' : state === 'matched' ? 'bg-[#edf7f0] text-[#3b7d56]' : 'bg-[#fff0f3] text-spark-coral')}>{searching ? <LoaderCircle className="h-6 w-6 animate-spin" /> : state === 'matched' ? <Check className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}</span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-spark-coral">{searching ? 'Searching the room' : state === 'matched' ? 'A shared interest found' : 'Auto-match'}</p>
            <h2 id="auto-match-title" className="mt-3 max-w-sm text-4xl font-bold tracking-[-.07em]">{searching ? 'Looking for someone who gets it.' : state === 'matched' ? 'Start with a hello.' : 'Find someone to talk to now.'}</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#6F6470]">{message || 'We’ll use your saved intent and interests to find a compatible person. You stay in control.'}</p>
            {searching && <div className="mt-8 flex items-center gap-2" aria-label="Searching"><span className="h-2.5 w-2.5 animate-bounce rounded-full bg-spark-coral" /><span className="h-2.5 w-2.5 animate-bounce rounded-full bg-spark-coral [animation-delay:120ms]" /><span className="h-2.5 w-2.5 animate-bounce rounded-full bg-spark-coral [animation-delay:240ms]" /></div>}
            <div className="mt-9 flex flex-wrap gap-2">{state === 'idle' || state === 'error' ? <button type="button" onClick={() => void startMatching()} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">{state === 'error' ? 'Try again' : 'Start searching'}<ArrowRight className="h-4 w-4" /></button> : state === 'waiting' ? <button type="button" onClick={() => void stopMatching()} className="rounded-full border border-dark-950/15 px-5 py-3 text-sm font-bold hover:border-dark-950/35">Stop searching</button> : state === 'matched' ? <button type="button" onClick={openChat} className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white">Open private chat <ArrowRight className="h-4 w-4" /></button> : null}</div>
          </div>
        </div>
        <p className="border-t border-dark-950/8 px-7 py-4 text-xs leading-5 text-[#6F6470] sm:px-9">No automatic connections. Chat first, then both decide whether to continue.</p>
      </section>
    </div>}
  </>;
}

