'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Compass, HeartHandshake, MessageCircle, Sparkles, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

const goals = [
  ['Meet someone new', 'Join small guided rooms and start with a shared experience.', UsersRound],
  ['Start something with someone', 'Send a private experience to a person already on your mind.', HeartHandshake],
  ['Find better conversations', 'Keep it light, social, and pressure-free.', MessageCircle],
];
const tones = ['Light and playful', 'Thoughtful and curious', 'Flirty, at my pace'];
const interests = ['Food & places', 'Music', 'Film & TV', 'Books', 'Creative things', 'Fitness', 'Travel', 'Games'];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Meet someone new');
  const [tone, setTone] = useState('Light and playful');
  const [selected, setSelected] = useState<string[]>(['Food & places', 'Music']);
  const [availability, setAvailability] = useState('Evenings');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toggleInterest = (item: string) => setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  const next = () => setStep(x => Math.min(x + 1, 4));
  const back = () => setStep(x => Math.max(x - 1, 1));
  async function finish() {
    const token = await getAccessToken();
    if (!token) { router.replace('/login'); return; }
    setSaving(true); setError('');
    const intent = goal === 'Meet someone new' ? 'friendship' : goal === 'Find better conversations' ? 'conversation' : 'dating';
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/discovery/me/`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ intents: [intent], interests: selected, is_discoverable: goal === 'Meet someone new', onboarding_completed: true }) });
      if (!response.ok) throw new Error('Your preferences could not be saved.');
      router.push('/home');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your preferences could not be saved.'); } finally { setSaving(false); }
  }
  return (
    <main className="min-h-screen bg-[#fffdfc] px-5 py-6 sm:px-8"><div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between"><Link href="/" className="text-[23px] font-bold tracking-[-.06em] text-dark-950">Duora</Link><span className="text-sm text-[#6F6470]">Step {step} of 4</span></header>
      <div className="mt-8 h-1 overflow-hidden rounded-full bg-[#281D32]/8"><div className="h-full rounded-full bg-spark-coral transition-all duration-300" style={{ width: `${step * 25}%` }} /></div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-20"><section>
        {step === 1 && <><p className="section-label">Start here</p><h1 className="mt-4 text-4xl font-bold tracking-[-.065em] sm:text-5xl">What would you like Duora to help with?</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">There is no wrong answer. You can change this whenever you want.</p><div className="mt-9 grid gap-3">{goals.map(([title, text, Icon]) => <button key={title as string} onClick={() => setGoal(title as string)} className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${goal === title ? 'border-spark-coral bg-[#FFF0F3]' : 'border-[#281D32]/10 bg-white hover:border-[#F7B8C7]'}`}><span className="mt-0.5 rounded-xl bg-white p-2.5 text-spark-coral"><Icon className="h-5 w-5" /></span><span><span className="block font-semibold text-dark-950">{title as string}</span><span className="mt-1 block text-sm leading-6 text-[#6F6470]">{text as string}</span></span>{goal === title && <Check className="ml-auto h-5 w-5 shrink-0 text-spark-coral" />}</button>)}</div></>}
        {step === 2 && <><p className="section-label">Your pace</p><h1 className="mt-4 text-4xl font-bold tracking-[-.065em] sm:text-5xl">What kind of space feels right?</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">This helps us recommend experiences and rooms that match your comfort level.</p><div className="mt-9 grid gap-3">{tones.map(item => <button key={item} onClick={() => setTone(item)} className={`flex items-center justify-between rounded-2xl border p-5 text-left font-semibold transition ${tone === item ? 'border-spark-coral bg-[#FFF0F3] text-dark-950' : 'border-[#281D32]/10 bg-white text-[#6F6470] hover:border-[#F7B8C7]'}`}><span>{item}</span>{tone === item && <Check className="h-5 w-5 text-spark-coral" />}</button>)}</div></>}
        {step === 3 && <><p className="section-label">A little context</p><h1 className="mt-4 text-4xl font-bold tracking-[-.065em] sm:text-5xl">What do you enjoy talking about?</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">Choose a few. We use these to create a better shared starting point, not to define you.</p><div className="mt-9 flex flex-wrap gap-3">{interests.map(item => <button key={item} onClick={() => toggleInterest(item)} className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${selected.includes(item) ? 'border-spark-coral bg-[#FFF0F3] text-spark-coral' : 'border-[#281D32]/10 bg-white text-[#6F6470] hover:border-[#F7B8C7]'}`}>{selected.includes(item) && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{item}</button>)}</div></>}
        {step === 4 && <><p className="section-label">One last thing</p><h1 className="mt-4 text-4xl font-bold tracking-[-.065em] sm:text-5xl">When are you usually up for a good conversation?</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#6F6470]">This helps us show rooms at useful times. You can always browse independently.</p><div className="mt-9 grid gap-3 sm:grid-cols-3">{['Mornings', 'Evenings', 'Weekends'].map(item => <button key={item} onClick={() => setAvailability(item)} className={`rounded-2xl border p-5 text-left text-sm font-semibold transition ${availability === item ? 'border-spark-coral bg-[#FFF0F3] text-dark-950' : 'border-[#281D32]/10 bg-white text-[#6F6470]'}`}>{availability === item && <Check className="mb-5 h-5 w-5 text-spark-coral" />}{item}</button>)}</div><div className="mt-8 rounded-2xl bg-[#FFF7F2] p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-spark-coral" />Your Duora starting point</p><p className="mt-2 text-sm leading-6 text-[#6F6470]">We will begin with {goal.toLowerCase()}, a {tone.toLowerCase()} tone, and room suggestions around {selected.slice(0, 2).join(' and ')}.</p></div></>}
        <div className="mt-10 flex items-center justify-between"><button onClick={back} disabled={step === 1 || saving} className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F6470] disabled:invisible"><ArrowLeft className="h-4 w-4" />Back</button>{step < 4 ? <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d94767]">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={finish} className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d94767] disabled:opacity-60">{saving ? 'Saving…' : 'Finish and go home'} <ArrowRight className="h-4 w-4" /></button>}</div>{error && <p role="alert" className="mt-4 text-sm text-spark-coral">{error}</p>}
      </section>
      <aside className="h-fit rounded-[28px] bg-dark-950 p-6 text-white lg:sticky lg:top-24"><Compass className="h-5 w-5 text-spark-rose" /><p className="mt-8 text-sm font-semibold text-spark-rose">Designed around your comfort</p><h2 className="mt-2 text-2xl font-bold tracking-[-.05em]">You stay in control.</h2><ul className="mt-6 space-y-4 text-sm leading-6 text-[#d7cfda]"><li>Join only the rooms that feel right.</li><li>Skip any prompt, leave any room.</li><li>Private chat requires a mutual choice.</li><li>Change these preferences whenever you want.</li></ul></aside>
      </div>
    </div></main>
  );
}
