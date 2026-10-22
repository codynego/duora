'use client';

import Link from 'next/link';
import { ArrowRight, Check, Clock3, Eye, MessageCircle, Search, Sparkles, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';
import { useCurrentUser } from '@/lib/current-user';

type Question = { id: string; text: string; category: string };
type Thought = { id: string; question: { text: string; category: string }; body: string; reply_count: number };
type Daily = { data: Question | null; answer: Thought | null; completed: boolean; server_now: string; next_reset_at: string };
type Activity = { requests: number; chats: number };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
const fallbackQuestion: Question = { id: '', text: 'What makes you feel genuinely understood by someone?', category: 'Relationships' };
const moves = [
  ['Explore thoughts', 'Find answers and perspectives that surprise you.', '/discover', Search, 'bg-[#E9E1F1]'],
  ['Join a conversation', 'Share a perspective or respectfully challenge one.', '/discover', MessageCircle, 'bg-[#DDE8D2]'],
  ['Find your people', 'Discover someone through their thoughts.', '/connections', UsersRound, 'bg-[#F5DCCB]'],
  ['Saved thoughts', 'Return to questions and discussions you liked.', '/discover?saved=1', Sparkles, 'bg-[#E8E1D5]'],
] as const;

export default function Home() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [answer, setAnswer] = useState('');
  const [thought, setThought] = useState<Thought | null>(null);
  const [activity, setActivity] = useState<Activity>({ requests: 0, chats: 0 });
  const [remaining, setRemaining] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (ready && !user) router.replace('/login'); }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user) return;
    async function loadHome() {
      const token = await getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const [dailyResponse, thoughtsResponse, connectionsResponse, threadsResponse] = await Promise.all([
          fetch(`${api}/api/v1/social/questions/daily/`, { headers }),
          fetch(`${api}/api/v1/social/explore/`, { headers }),
          fetch(`${api}/api/v1/connections/`, { headers }),
          fetch(`${api}/api/v1/connections/threads/`, { headers }),
        ]);
        if (dailyResponse.ok) {
          const body = await dailyResponse.json() as Daily;
          setDaily(body); setServerOffset(new Date(body.server_now).getTime() - Date.now());
          if (body.answer) setAnswer(body.answer.body);
          else if (body.data?.id) setAnswer(window.localStorage.getItem(`duora:daily-draft:${body.data.id}`) ?? '');
        }
        if (thoughtsResponse.ok) { const body = await thoughtsResponse.json() as { data?: Thought[] }; setThought(body.data?.[0] ?? null); }
        if (connectionsResponse.ok) { const body = await connectionsResponse.json() as { requests?: unknown[] }; setActivity((current) => ({ ...current, requests: body.requests?.length ?? 0 })); }
        if (threadsResponse.ok) { const body = await threadsResponse.json() as { data?: unknown[] }; setActivity((current) => ({ ...current, chats: body.data?.length ?? 0 })); }
      } finally { setLoading(false); }
    }
    void loadHome();
  }, [ready, user]);

  useEffect(() => {
    if (!daily?.next_reset_at) return;
    const update = () => setRemaining(Math.max(0, new Date(daily.next_reset_at).getTime() - (Date.now() + serverOffset)));
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [daily?.next_reset_at, serverOffset]);

  async function publishThought() {
    const question = daily?.data;
    if (!answer.trim() || !question?.id) { setError('Write a thought before sharing it.'); return; }
    const token = await getAccessToken(); if (!token) { router.replace('/login'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch(`${api}/api/v1/social/thoughts/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: question.id, body: answer.trim() }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.detail ?? 'Your thought could not be shared. Try again.');
      if (question.id) window.localStorage.removeItem(`duora:daily-draft:${question.id}`);
      setDaily((current) => current ? { ...current, completed: true, answer: body.data } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your thought could not be shared.'); } finally { setSaving(false); }
  }

  if (!ready || !user) return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  const question = daily?.data ?? fallbackQuestion;
  const hasActivity = activity.requests > 0 || activity.chats > 0;
  const time = formatCountdown(remaining);

  return <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]"><AppNav /><main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
    <header className="flex items-end justify-between gap-6"><div><p className="dashboard-kicker"><span />Your space</p><h1 className="dashboard-display mt-4 max-w-3xl text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">A little curiosity goes a long way<span className="text-[#7454A6]">.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-[#6E6975]">Share a thought, discover a new perspective, or start a conversation.</p></div><span className="hidden items-center gap-2 rounded-full bg-[#E9E1F1] px-4 py-2 text-xs font-semibold text-[#5D487A] sm:inline-flex"><Sparkles className="h-3.5 w-3.5" />Meet through minds</span></header>

    <section id="daily-question" className="mt-10 rounded-[26px] bg-[#292630] p-6 text-white shadow-[0_18px_42px_rgba(41,38,48,.14)] sm:p-9"><div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#B9A7C9]"><span>Today’s question</span><span className="flex items-center gap-1.5 text-white/45"><Eye className="h-3.5 w-3.5" />Anonymous</span></div>{daily?.completed ? <div className="flex min-h-[300px] flex-col justify-between pt-12"><div><div className="grid h-10 w-10 place-items-center rounded-full bg-[#DDE8D2] text-[#4F713D]"><Check className="h-5 w-5" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#B9A7C9]">You’ve shared today’s thought</p><h2 className="dashboard-display mt-3 max-w-2xl text-4xl leading-[.98] tracking-[-.055em] sm:text-5xl">Your answer is published.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/60">The daily ritual is complete. Keep exploring, joining discussions, and finding people through their thoughts.</p></div><div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">New daily question in</p><p className="mt-2 font-mono text-3xl font-semibold tracking-[-.04em] text-white">{time.hours} <span className="text-xs font-sans font-bold tracking-[.12em] text-white/45">HOURS</span> <span className="ml-2">{time.minutes} <span className="text-xs font-sans font-bold tracking-[.12em] text-white/45">MINUTES</span></span> <span className="ml-2">{time.seconds} <span className="text-xs font-sans font-bold tracking-[.12em] text-white/45">SECONDS</span></span></p></div><Link href={`/discover?category=${encodeURIComponent(question.category)}`} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#292630]">Explore other answers <ArrowRight className="h-4 w-4" /></Link></div></div> : <><h2 className="dashboard-display mt-12 max-w-3xl text-4xl leading-[.98] tracking-[-.055em] sm:text-6xl">{loading ? 'Finding today’s question…' : question.text}</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/60">Your daily opportunity to share something real.</p><textarea value={answer} onChange={(event) => { setAnswer(event.target.value); if (daily?.data?.id) window.localStorage.setItem(`duora:daily-draft:${daily.data.id}`, event.target.value); }} maxLength={500} disabled={loading || saving} placeholder="Write your answer..." className="mt-7 min-h-24 w-full resize-y rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/35 transition focus:min-h-36 focus:border-[#B9A7C9] focus:ring-4 focus:ring-[#B9A7C9]/15" /><div className="mt-3 flex items-center justify-between text-xs text-white/40"><span>{answer.length}/500 characters</span><span>One daily answer · Anonymous to other users</span></div><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="button" onClick={() => void publishThought()} disabled={!answer.trim() || saving || loading || !daily?.data?.id} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#292630] disabled:cursor-not-allowed disabled:opacity-45">{saving ? 'Sharing…' : 'Share today’s thought'} <ArrowRight className="h-4 w-4" /></button><Link href="/discover" className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-white/55 hover:text-white"><Clock3 className="h-3.5 w-3.5" />Explore other questions</Link></div>{error && <p role="alert" className="mt-4 text-sm text-[#F4B5C5]">{error}</p>}</>}</section>

    <section className="mt-8 grid gap-3 rounded-[22px] border border-[#292630]/10 bg-white p-5 sm:grid-cols-3 sm:p-6"><Link href="/discover" className="flex items-center gap-3 rounded-2xl bg-[#F7F5F0] p-4"><Search className="h-4 w-4 text-[#7454A6]" /><span><strong className="block text-sm">Explore other answers</strong><span className="mt-1 block text-xs text-[#6E6975]">Discover different perspectives.</span></span></Link><Link href="/discover" className="flex items-center gap-3 rounded-2xl bg-[#F7F5F0] p-4"><MessageCircle className="h-4 w-4 text-[#7454A6]" /><span><strong className="block text-sm">Join discussions</strong><span className="mt-1 block text-xs text-[#6E6975]">Reply, relate, or challenge an idea.</span></span></Link><Link href="/connections" className="flex items-center gap-3 rounded-2xl bg-[#F7F5F0] p-4"><UsersRound className="h-4 w-4 text-[#7454A6]" /><span><strong className="block text-sm">Discover people</strong><span className="mt-1 block text-xs text-[#6E6975]">Connect when someone interests you.</span></span></Link></section>

    {thought && <section className="mt-14 rounded-[24px] border border-[#292630]/10 bg-white p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="dashboard-kicker"><span />A thought to explore</p><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#7454A6]">Featured question · {thought.question.category}</p></div><MessageCircle className="h-5 w-5 text-[#7454A6]" /></div><blockquote className="dashboard-display mt-8 max-w-3xl text-3xl leading-[1.02] tracking-[-.05em] sm:text-4xl">“{thought.body}”</blockquote><p className="mt-5 text-sm text-[#6E6975]">{thought.question.text}</p><Link href={`/discover/${thought.id}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">Read the conversation <ArrowRight className="h-4 w-4" /></Link></section>}
    {hasActivity && <section className="mt-14 rounded-[24px] border border-[#292630]/10 bg-white p-6 sm:p-8"><p className="dashboard-kicker"><span />Your activity</p><h2 className="dashboard-display mt-3 text-3xl tracking-[-.05em]">A few things changed.</h2><div className="mt-6 flex flex-wrap gap-3">{activity.requests > 0 && <Link href="/connections" className="rounded-2xl bg-[#F7F5F0] px-4 py-3 text-sm font-semibold">{activity.requests} connection request{activity.requests === 1 ? '' : 's'} waiting <ArrowRight className="ml-2 inline h-4 w-4 text-[#7454A6]" /></Link>}{activity.chats > 0 && <Link href="/connections" className="rounded-2xl bg-[#F7F5F0] px-4 py-3 text-sm font-semibold">{activity.chats} private conversation{activity.chats === 1 ? '' : 's'} <ArrowRight className="ml-2 inline h-4 w-4 text-[#7454A6]" /></Link>}</div></section>}
    <p className="mt-14 border-t border-[#292630]/10 pt-6 text-sm text-[#6E6975]">The daily question creates a rhythm. Everything else stays open.</p>
  </main></div>;
}

function formatCountdown(value: number) { const total = Math.floor(value / 1000); return { hours: String(Math.floor(total / 3600)).padStart(2, '0'), minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'), seconds: String(total % 60).padStart(2, '0') }; }
