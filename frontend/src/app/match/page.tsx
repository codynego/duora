'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, ShieldCheck, UsersRound } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

const options = [
  { label: 'Meet new friends', intent: 'friendship', detail: 'A relaxed group experience with people open to friendship.' },
  { label: 'A thoughtful conversation', intent: 'conversation', detail: 'A guided room for listening, sharing, and good questions.' },
  { label: 'Dating, at my pace', intent: 'dating', detail: 'A consent-led discovery room with people who selected dating.' },
] as const;
type Room = { code: string; title: string; description: string; max_members: number; duration_minutes: number; starts_at: string };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function MatchPage() {
  const [choice, setChoice] = useState(0);
  const [room, setRoom] = useState<Room | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function findRoom() {
    const token = await getAccessToken();
    if (!token) { setError('Sign in to find a room.'); return; }
    setLoading(true); setError(''); setReason('');
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const current = await fetch(`${api}/api/v1/discovery/me/`, { headers });
      const profile = current.ok ? await current.json() : {};
      const response = await fetch(`${api}/api/v1/discovery/me/`, { method: 'PATCH', headers, body: JSON.stringify({ intents: [options[choice].intent], interests: profile.interests ?? [], languages: profile.languages ?? [], city: profile.city ?? '', is_discoverable: true }) });
      if (!response.ok) throw new Error('Your discovery settings could not be saved.');
      const match = await fetch(`${api}/api/v1/discovery/recommendation/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await match.json();
      if (!match.ok) throw new Error(data.detail ?? 'A room could not be found.');
      setRoom(data.data ?? null); setReason(data.reason ?? 'No compatible room is available right now.');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'A room could not be found.'); } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#fffdfc] px-5 py-7 text-dark-950 sm:px-8 sm:py-10"><div className="mx-auto max-w-3xl"><Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"><ArrowLeft className="h-4 w-4" />Back home</Link><section className="mt-12 text-center"><p className="section-label">Find a room</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">What are you open to today?</h1><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#6F6470]">We only look within the intent you choose. You review a room before you join it.</p></section>{!room && !reason ? <section className="mx-auto mt-10 max-w-xl"><p className="text-sm font-bold">Right now, I’m looking for…</p><div className="mt-4 space-y-3">{options.map((item, index) => <button key={item.intent} onClick={() => setChoice(index)} className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${choice === index ? 'border-spark-coral bg-[#fff5f6]' : 'border-dark-950/10 bg-white hover:border-dark-950/30'}`}><span><span className="block text-sm font-bold">{item.label}</span><span className="mt-1 block text-xs font-normal leading-5 text-[#6F6470]">{item.detail}</span></span>{choice === index && <Check className="h-5 w-5 shrink-0 text-spark-coral" />}</button>)}</div><button disabled={loading} onClick={findRoom} className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Finding a room…' : 'Find a room for me'} <ArrowRight className="h-4 w-4" /></button></section> : room ? <section className="mx-auto mt-10 max-w-xl rounded-[30px] border border-dark-950/10 bg-white p-7 text-center shadow-[0_18px_50px_rgba(40,29,50,.08)] sm:p-9"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3]"><UsersRound className="h-5 w-5 text-spark-coral" /></span><p className="mt-6 text-xs font-bold tracking-[.15em] text-spark-coral">A COMPATIBLE ROOM</p><h2 className="mt-2 text-3xl font-bold tracking-[-.055em]">{room.title}</h2><p className="mt-3 text-sm leading-6 text-[#6F6470]">{room.description}</p><div className="mt-7 flex justify-center gap-3 text-xs font-bold text-[#6F6470]"><span className="inline-flex items-center gap-1"><UsersRound className="h-4 w-4" />Up to {room.max_members}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{room.duration_minutes} min</span></div><Link href={`/rooms/${room.code}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white">Review this room <ArrowRight className="h-4 w-4" /></Link><button onClick={() => { setRoom(null); setReason(''); }} className="mt-4 block w-full text-sm font-bold text-[#6F6470]">Try another intention</button></section> : <section className="mx-auto mt-10 max-w-xl rounded-[30px] border border-dashed border-dark-950/15 bg-white p-8 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><h2 className="mt-4 text-2xl font-bold">No room is ready right now.</h2><p className="mt-3 text-sm leading-6 text-[#6F6470]">{reason}</p><Link href="/discover" className="mt-7 inline-flex rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Browse scheduled rooms</Link></section>}{error && <p role="alert" className="mx-auto mt-5 max-w-xl rounded-2xl bg-[#fff0f3] p-4 text-sm text-spark-coral">{error}</p>}<p className="mx-auto mt-10 flex max-w-xl items-start gap-2 text-xs leading-5 text-[#6F6470]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-spark-coral" />People with different discovery intents are never mixed. You can leave, block, or report at any time.</p></div></main>;
}
