'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Link2, LockKeyhole, Sparkles } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

const experiences = [
  { key: 'predict-my-answer', title: 'Predict My Answer', meta: '8 minutes · 2 people', detail: 'A playful way to see what you notice about each other.' },
  { key: 'better-question', title: 'The Better Question', meta: '15 minutes · 2 people', detail: 'Prompts that take the pressure off the first real conversation.' },
  { key: 'make-a-plan', title: 'Make a Plan', meta: '10 minutes · 2 people', detail: 'Turn shared taste into something you could actually do together.' },
];

export default function InvitePage() {
  const [selected, setSelected] = useState(0);
  const [inviteUrl, setInviteUrl] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const experience = experiences[selected];

  async function createInvite() {
    const token = await getAccessToken();
    if (!token) return setError('Sign in to create a private invitation.');
    setCreating(true); setError(''); setCopied(false);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/rooms/private/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ experience: experience.key }) });
      const body = await response.json() as { data?: { room?: { code?: string }; invite?: { token?: string } }; detail?: string };
      if (!response.ok || !body.data?.invite?.token || !body.data.room?.code) throw new Error(body.detail ?? 'We could not create that private room.');
      setInviteUrl(`${window.location.origin}/i/${body.data.invite.token}`);
      setRoomCode(body.data.room.code);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'We could not create that private room.'); } finally { setCreating(false); }
  }

  async function copyInvite() { try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); } catch { setError('Copy was blocked. Select the link and copy it manually.'); } }

  return <main className="min-h-screen bg-[#fffdfc] px-5 py-7 text-dark-950 sm:px-8 sm:py-10"><div className="mx-auto max-w-4xl"><Link href="/home" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"><ArrowLeft className="h-4 w-4" />Back home</Link><section className="mt-10 grid gap-10 lg:grid-cols-[1fr_.78fr]"><div><p className="section-label">Private invitation</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Start with someone you already have in mind.</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">Choose an experience. We create a private room and give you one link to send—nothing becomes public.</p><div className="mt-9 space-y-3">{experiences.map((item, index) => <button key={item.key} onClick={() => { setSelected(index); setInviteUrl(''); setRoomCode(''); setError(''); }} className={`w-full rounded-2xl border p-5 text-left transition ${selected === index ? 'border-spark-coral bg-[#fff5f6]' : 'border-dark-950/10 bg-white hover:border-dark-950/30'}`}><span className="flex items-start justify-between gap-4"><span><span className="block text-base font-bold">{item.title}</span><span className="mt-1 block text-sm text-[#6F6470]">{item.detail}</span><span className="mt-3 block text-xs font-semibold text-spark-coral">{item.meta}</span></span>{selected === index && <Check className="h-5 w-5 shrink-0 text-spark-coral" />}</span></button>)}</div></div><aside className="self-start rounded-[28px] bg-dark-950 p-7 text-white sm:p-8"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><LockKeyhole className="h-5 w-5 text-spark-rose" /></span><p className="mt-9 text-xs font-bold tracking-[.15em] text-spark-rose">JUST THE TWO OF YOU</p><h2 className="mt-3 text-2xl font-bold tracking-[-.05em]">{experience.title}</h2><p className="mt-3 text-sm leading-6 text-white/65">The link opens one private room. It expires in 24 hours and does not create a public profile.</p>{inviteUrl ? <div className="mt-8 rounded-2xl bg-white p-4 text-dark-950"><p className="text-xs font-bold text-[#6F6470]">YOUR PRIVATE LINK</p><p className="mt-2 break-all text-sm font-bold">{inviteUrl}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={copyInvite} className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-4 py-2.5 text-sm font-bold text-white">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</button>{roomCode && <Link href={`/rooms/${roomCode}`} className="inline-flex items-center gap-2 rounded-full border border-dark-950/15 px-4 py-2.5 text-sm font-bold">Join room <ArrowRight className="h-4 w-4" /></Link>}</div>{copied && <p role="status" className="mt-3 text-xs font-bold text-[#4d8568]">Link copied to your clipboard.</p>}</div> : <button disabled={creating} onClick={createInvite} className="mt-8 inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70">{creating ? 'Creating room…' : 'Create private link'} <Link2 className="h-4 w-4" /></button>}{error && <p role="alert" className="mt-4 text-sm text-spark-rose">{error}</p>}<p className="mt-5 flex gap-2 text-xs leading-5 text-white/50"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />You can send this to a partner, date, friend, or someone you want to know better.</p></aside></section></div></main>;
}
