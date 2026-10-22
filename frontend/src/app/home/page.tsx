'use client';

import Link from 'next/link';
import { ArrowRight, Check, Compass, Eye, MessageCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';
import { useCurrentUser } from '@/lib/current-user';

type Question = { id: string; text: string; category: string };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
const fallbackQuestion: Question = { id: '', text: 'What’s something you wish people understood about you?', category: 'Relationships' };
const collections = [
  ['Relationships', 'Love, trust, and attraction', 'bg-[#E9E1F1]'],
  ['Deep conversations', 'Ideas worth sitting with', 'bg-[#DDE8D2]'],
  ['Fun & everyday life', 'Small joys and strong opinions', 'bg-[#F5DCCB]'],
];

export default function Home() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [question, setQuestion] = useState<Question>(fallbackQuestion);
  const [answer, setAnswer] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !user) return;
    async function loadQuestion() {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${api}/api/v1/social/questions/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (response.ok) {
          const body = await response.json() as { data?: Question[] };
          if (body.data?.[0]) setQuestion(body.data[0]);
        }
      } finally { setLoading(false); }
    }
    void loadQuestion();
  }, [ready, user]);

  useEffect(() => { if (ready && !user) router.replace('/login'); }, [ready, router, user]);

  async function publishThought() {
    if (!answer.trim() || !question.id) return;
    const token = await getAccessToken();
    if (!token) { router.replace('/login'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch(`${api}/api/v1/social/thoughts/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: question.id, body: answer.trim() }) });
      if (!response.ok) throw new Error('Your thought could not be shared. Try again.');
      setPublished(true);
      setAnswer('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your thought could not be shared.'); } finally { setSaving(false); }
  }

  if (!ready || !user) return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;

  const firstName = user.display_name?.split(' ')[0] || 'there';
  return (
    <div className="dashboard-shell min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-7xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <header className="flex items-end justify-between gap-6"><div><p className="dashboard-kicker"><span />Your space to begin</p><h1 className="dashboard-display mt-4 text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">Good morning, {firstName}<span className="text-[#7454A6]">.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-[#6E6975]">A question can take you somewhere unexpected.</p></div><Link href="/discover" className="hidden items-center gap-2 text-sm font-semibold text-[#7454A6] hover:text-[#553781] sm:inline-flex">Explore thoughts <ArrowRight className="h-4 w-4" /></Link></header>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.18fr_.82fr]">
          <div className={`dashboard-question relative overflow-hidden rounded-[24px] p-6 sm:p-9 ${published ? 'bg-[#DDE8D2]' : 'bg-[#292630] text-white'}`}>
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#BCA9D2]/30" /><div className="absolute -right-6 -top-10 h-36 w-36 rounded-full border border-[#BCA9D2]/25" />
            {published ? <><div className="relative z-10 flex h-full min-h-[350px] flex-col justify-between"><div><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#4F713D]"><Check className="h-5 w-5" /></span><p className="mt-9 text-xs font-bold uppercase tracking-[.16em] text-[#4F713D]">Your thought is out there</p><h2 className="dashboard-display mt-4 max-w-xl text-5xl leading-[.95] tracking-[-.06em] text-[#292630] sm:text-6xl">That was worth sharing.</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#52634A]">Now see what other people are thinking about the same kinds of things.</p></div><Link href="/discover" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#292630] px-5 py-3 text-sm font-semibold text-white">Explore related thoughts <ArrowRight className="h-4 w-4" /></Link></div></> : <><div className="relative z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[#B9A7C9]"><span>Today’s question</span><span className="flex items-center gap-1.5 text-white/45"><Eye className="h-3.5 w-3.5" />Anonymous to other users</span></div><h2 className="dashboard-display relative z-10 mt-12 max-w-2xl text-4xl leading-[.98] tracking-[-.055em] sm:text-6xl">{question.text}</h2><p className="relative z-10 mt-5 text-sm text-white/55">You can share as much or as little as you want.</p><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={500} disabled={loading || saving} placeholder="Write your answer..." aria-label="Your anonymous answer" className="relative z-10 mt-8 min-h-28 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#B9A7C9] focus:ring-4 focus:ring-[#B9A7C9]/15" /><div className="relative z-10 mt-3 flex items-center justify-between text-xs text-white/40"><span>{answer.length}/500</span><span>Nothing public about your identity</span></div><div className="relative z-10 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="button" onClick={() => void publishThought()} disabled={!answer.trim() || saving || !question.id} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#292630] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">{saving ? 'Sharing…' : 'Share my thought'} <ArrowRight className="h-4 w-4" /></button><span className="text-xs text-white/40">You can skip this and explore first.</span></div>{error && <p role="alert" className="relative z-10 mt-4 text-sm text-[#F4B5C5]">{error}</p>}</>}
          </div>
          <aside className="rounded-[24px] border border-[#292630]/10 bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E1F1] text-[#7454A6]"><Sparkles className="h-5 w-5" /></span><span className="text-xs font-semibold text-[#958F9B]">A gentle place to start</span></div><h2 className="dashboard-display mt-10 text-4xl leading-[.98] tracking-[-.055em]">The best conversations rarely start with a perfect line.</h2><p className="mt-4 text-sm leading-6 text-[#6E6975]">They start with a thought that gives someone else a way in.</p><div className="mt-9 border-t border-[#292630]/10 pt-5"><p className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-[#7454A6]" />No profile performance required.</p><p className="mt-2 text-xs leading-5 text-[#958F9B]">Answer honestly. Stay anonymous. Decide what happens next.</p></div></aside>
        </section>

        <section className="mt-16"><div className="flex items-end justify-between gap-4"><div><p className="dashboard-kicker"><span />In the mood for something else?</p><h2 className="dashboard-display mt-3 text-4xl leading-[.98] tracking-[-.06em] sm:text-5xl">Explore beyond today’s prompt.</h2></div><Link href="/discover" className="hidden items-center gap-2 text-sm font-semibold text-[#7454A6] sm:inline-flex">See Explore <Compass className="h-4 w-4" /></Link></div><div className="mt-7 grid gap-4 sm:grid-cols-3">{collections.map(([title, description, color]) => <Link href={`/discover?category=${encodeURIComponent(title)}`} key={title} className={`group rounded-[20px] ${color} p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(41,38,48,.09)]`}><div className="flex items-start justify-between"><span className="text-xs font-bold uppercase tracking-[.14em] text-[#5F5967]">Collection</span><ArrowRight className="h-4 w-4 text-[#7454A6] transition group-hover:translate-x-1" /></div><h3 className="mt-12 text-xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5F5967]">{description}</p></Link>)}</div></section>

        <section className="mt-16 grid gap-5 lg:grid-cols-[1fr_.7fr]"><div className="rounded-[24px] border border-[#292630]/10 bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="dashboard-kicker"><span />Your activity</p><h2 className="dashboard-display mt-3 text-3xl tracking-[-.05em]">Keep the thread going.</h2></div><MessageCircle className="h-5 w-5 text-[#7454A6]" /></div><div className="mt-8 rounded-2xl bg-[#F7F5F0] p-5"><p className="text-sm font-semibold">Your activity will appear here.</p><p className="mt-2 text-sm leading-6 text-[#6E6975]">Replies to your thoughts and discussions you follow will stay together in one quiet place.</p><Link href="/connections" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">Open Connections <ArrowRight className="h-4 w-4" /></Link></div></div><aside className="rounded-[24px] bg-[#7454A6] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#E9E1F1]">Remember</p><h2 className="dashboard-display mt-10 text-4xl leading-[.98] tracking-[-.055em]">Curiosity is enough reason to look around.</h2><p className="mt-4 text-sm leading-6 text-white/70">No streaks. No pressure. Just a place to find a thought that stays with you.</p><Link href="/discover" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#292630]">Go to Explore <ArrowRight className="h-4 w-4" /></Link></aside></section>
      </main>
    </div>
  );
}
