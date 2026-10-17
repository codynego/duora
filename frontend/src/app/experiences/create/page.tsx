'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe2, Link2, LockKeyhole, UsersRound } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';

const experiences = [
  { key: 'predict-my-answer', title: 'Predict My Answer', detail: 'Guess first, then reveal what each person actually chose.', limit: 2 },
  { key: 'better-question', title: 'The Better Question', detail: 'Prompts that give a new conversation somewhere real to go.', limit: 4 },
  { key: 'make-a-plan', title: 'Make a Plan', detail: 'Turn shared taste into one small plan you could make real.', limit: 2 },
  { key: 'truth-or-dare', title: 'Truth or Dare', detail: 'A playful room built around choosing how open you want to be.', limit: 6 },
];

export default function CreateExperiencePage() {
  const router = useRouter(); const search = useSearchParams();
  const initial = experiences.findIndex((item) => item.key === search.get('experience'));
  const [selected, setSelected] = useState(initial >= 0 ? initial : 0); const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [tone, setTone] = useState('Easygoing'); const [audience, setAudience] = useState('adults'); const [maxMembers, setMaxMembers] = useState(2); const [city, setCity] = useState('');
  const [creating, setCreating] = useState(false); const [error, setError] = useState(''); const [inviteUrl, setInviteUrl] = useState('');
  const experience = experiences[selected];
  const capacities = [2, 4, 6].filter((value) => value <= experience.limit);

  function chooseExperience(index: number) { setSelected(index); setMaxMembers(Math.min(maxMembers, experiences[index].limit)); }
  async function createRoom() {
    const token = await getAccessToken(); if (!token) { setError('Sign in to create an experience.'); return; }
    setCreating(true); setError('');
    try {
      const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
      const body = visibility === 'private' ? { experience: experience.key } : { experience: experience.key, tone, audience, max_members: maxMembers, city };
      const response = await fetch(`${api}/api/v1/rooms/${visibility === 'private' ? 'private' : 'public'}/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail ?? Object.values(data).flat().join(' ') ?? 'Could not create this experience.');
      if (visibility === 'private') { const inviteToken = data?.data?.invite?.token; if (!inviteToken) throw new Error('The invite link could not be created.'); setInviteUrl(`${window.location.origin}/i/${inviteToken}`); }
      else router.push('/discover');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not create this experience.'); } finally { setCreating(false); }
  }
  async function copyInvite() { await navigator.clipboard?.writeText(inviteUrl); }

  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav /><main className="mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14"><Link href="/experiences" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"><ArrowLeft className="h-4 w-4" />Experiences</Link><div className="mt-8 grid gap-9 lg:grid-cols-[1fr_.7fr]"><section><p className="section-label">Create an experience</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Make a room that fits the moment.</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">Choose the format first. Then decide whether it is for someone you know or for a small public room on Duora.</p><p className="mt-10 text-sm font-bold">1. Choose an experience</p><div className="mt-4 grid gap-3">{experiences.map((item, index) => <button key={item.key} onClick={() => chooseExperience(index)} className={`rounded-2xl border p-5 text-left transition ${selected === index ? 'border-spark-coral bg-[#fff0f3]' : 'border-dark-950/10 bg-white hover:border-dark-950/30'}`}><span className="flex items-start justify-between gap-4"><span><span className="block font-bold">{item.title}</span><span className="mt-1 block text-sm leading-6 text-[#6F6470]">{item.detail}</span><span className="mt-3 block text-xs font-semibold text-spark-coral">Up to {item.limit} people</span></span>{selected === index && <Check className="h-5 w-5 shrink-0 text-spark-coral" />}</span></button>)}</div></section><aside className="self-start rounded-[30px] border border-dark-950/10 bg-white p-6 shadow-[0_14px_45px_rgba(40,29,50,.06)] sm:p-7"><p className="text-sm font-bold">2. Who is this room for?</p><div className="mt-4 grid gap-2"><button onClick={() => setVisibility('private')} className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${visibility === 'private' ? 'border-spark-coral bg-[#fff0f3]' : 'border-dark-950/10'}`}><LockKeyhole className="mt-0.5 h-4 w-4 text-spark-coral" /><span><b className="block text-sm">Private invitation</b><span className="mt-1 block text-xs leading-5 text-[#6F6470]">Create one link for a person you choose.</span></span></button><button onClick={() => setVisibility('public')} className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${visibility === 'public' ? 'border-spark-coral bg-[#fff0f3]' : 'border-dark-950/10'}`}><Globe2 className="mt-0.5 h-4 w-4 text-spark-coral" /><span><b className="block text-sm">Public room</b><span className="mt-1 block text-xs leading-5 text-[#6F6470]">Publish it in Discover for compatible people to join.</span></span></button></div>{visibility === 'public' && <div className="mt-7 space-y-5 border-t border-dark-950/8 pt-6"><label className="block text-sm font-bold">Tone<select value={tone} onChange={(event) => setTone(event.target.value)} className="mt-2 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm"><option>Easygoing</option><option>Playful</option><option>Thoughtful</option><option>Flirty</option></select></label><label className="block text-sm font-bold">Audience<select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm"><option value="adults">Adults (18+)</option><option value="all">Everyone</option></select></label><div><p className="text-sm font-bold">Maximum people</p><div className="mt-2 flex gap-2">{capacities.map((capacity) => <button key={capacity} onClick={() => setMaxMembers(capacity)} className={`rounded-full px-3 py-2 text-sm font-bold ${maxMembers === capacity ? 'bg-dark-950 text-white' : 'bg-dark-950/5 text-[#6F6470]'}`}>{capacity}</button>)}</div></div><label className="block text-sm font-bold">City <span className="font-normal text-[#6F6470]">optional</span><input value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} placeholder="Online or your city" className="mt-2 w-full rounded-xl border border-dark-950/12 px-3 py-2.5 text-sm" /></label></div>}<div className="mt-8 rounded-2xl bg-[#fff8dc] p-4"><p className="text-xs font-bold text-[#7a5b19]">{visibility === 'public' ? 'This will appear in Discover as soon as you publish it.' : 'This room will not appear in Discover.'}</p></div>{inviteUrl ? <div className="mt-5 rounded-2xl bg-dark-950 p-4 text-white"><p className="text-xs font-bold text-spark-rose">PRIVATE LINK READY</p><p className="mt-2 break-all text-sm">{inviteUrl}</p><button onClick={copyInvite} className="mt-3 inline-flex items-center gap-2 rounded-full bg-spark-coral px-4 py-2 text-sm font-bold"><Link2 className="h-4 w-4" />Copy link</button></div> : <button disabled={creating} onClick={createRoom} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{creating ? 'Creating…' : visibility === 'public' ? 'Publish to Discover' : 'Create private link'} <ArrowRight className="h-4 w-4" /></button>}{error && <p role="alert" className="mt-3 text-sm text-spark-coral">{error}</p>}</aside></div></main></div>;
}
