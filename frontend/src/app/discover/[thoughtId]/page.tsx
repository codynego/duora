'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Heart, MessageCircle, Send, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';
import { useCurrentUser } from '@/lib/current-user';

type Thought = { id: string; question: { text: string; category: string }; body: string; author: { label: string }; reply_count: number; relate_count: number; viewer_related: boolean };
type Reply = { id: string; body: string; author: { label: string }; created_at: string };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function DiscussionPage() {
  const params = useParams<{ thoughtId: string }>();
  const router = useRouter();
  const { user, ready } = useCurrentUser();
  const [thought, setThought] = useState<Thought | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);
  const [related, setRelated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (ready && !user) router.replace('/login'); }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user || !params.thoughtId) return;
    async function load() {
      const token = await getAccessToken();
      const response = await fetch(`${api}/api/v1/social/thoughts/${params.thoughtId}/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const body = await response.json().catch(() => null);
      if (!response.ok) setError(body?.detail ?? 'This discussion could not be opened.');
      else { setThought(body.data); setReplies(body.replies ?? []); setRelated(Boolean(body.data?.viewer_related)); }
      setLoading(false);
    }
    void load();
  }, [params.thoughtId, ready, user]);

  async function toggleRelate() {
    const token = await getAccessToken();
    if (!token || !thought) return;
    const response = await fetch(`${api}/api/v1/social/thoughts/${thought.id}/relate/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return;
    const body = await response.json(); setRelated(Boolean(body.related)); setThought({ ...thought, relate_count: body.relate_count });
  }

  async function postReply() {
    if (!reply.trim() || !thought) return;
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(`${api}/api/v1/social/thoughts/${thought.id}/replies/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ body: reply.trim() }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setError(body?.detail ?? 'Your reply could not be posted.'); return; }
    setReplies((current) => [...current, body.data]); setReply(''); setThought({ ...thought, reply_count: thought.reply_count + 1 });
  }

  async function connect() {
    if (!thought) return;
    const token = await getAccessToken(); if (!token) return;
    const response = await fetch(`${api}/api/v1/social/thoughts/${thought.id}/connect/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setSent(true);
  }

  if (!ready || !user) return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  return <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]"><AppNav /><main className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14"><Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E6975] hover:text-[#292630]"><ArrowLeft className="h-4 w-4" />Back to Explore</Link>{loading ? <div className="mt-8 h-96 animate-pulse rounded-[24px] bg-[#E9E1F1]" /> : error ? <div className="mt-8 rounded-[24px] bg-[#F8E1E7] p-6 text-sm text-[#9A3650]">{error}</div> : thought ? <><header className="mt-10"><p className="dashboard-kicker"><span />The conversation</p><p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[#7454A6]">{thought.question.category}</p><h1 className="dashboard-display mt-4 text-5xl leading-[.95] tracking-[-.065em] sm:text-7xl">{thought.question.text}</h1></header><section className="mt-8 rounded-[24px] bg-white p-6 shadow-[0_18px_45px_rgba(41,38,48,.08)] sm:p-8"><div className="flex items-center gap-2 text-xs font-semibold text-[#7454A6]"><UserRound className="h-4 w-4" />{thought.author.label}</div><p className="mt-6 font-medium text-xl leading-8 text-[#292630]">“{thought.body}”</p><div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#292630]/10 pt-5"><button type="button" onClick={() => void toggleRelate()} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${related ? 'bg-[#E9E1F1] text-[#7454A6]' : 'bg-[#F7F5F0] text-[#6E6975]'}`}><Heart className="h-4 w-4" fill={related ? 'currentColor' : 'none'} />I relate <span className="text-xs opacity-60">{thought.relate_count}</span></button><button type="button" onClick={() => document.getElementById('reply-box')?.focus()} className="inline-flex items-center gap-2 rounded-full bg-[#F7F5F0] px-4 py-2.5 text-sm font-semibold text-[#6E6975]"><MessageCircle className="h-4 w-4" />Reply</button><button type="button" onClick={() => void connect()} className="inline-flex items-center gap-2 rounded-full bg-[#292630] px-4 py-2.5 text-sm font-semibold text-white"><UserRound className="h-4 w-4" />Discover this person</button></div></section>{sent && <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#DDE8D2] p-4 text-sm font-semibold text-[#496436]"><Check className="h-5 w-5" />Your connection request has been sent. <Link href="/connections" className="ml-auto underline">View</Link></div>}<section className="mt-12"><div className="flex items-center justify-between"><div><p className="dashboard-kicker"><span />Explore different perspectives</p><h2 className="dashboard-display mt-3 text-3xl tracking-[-.05em]">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</h2></div></div><div className="mt-6 space-y-4">{replies.map((item) => <article key={item.id} className="rounded-[20px] border border-[#292630]/10 bg-white p-5"><div className="flex items-center gap-2 text-xs font-semibold text-[#7454A6]"><UserRound className="h-3.5 w-3.5" />{item.author.label}</div><p className="mt-4 text-sm leading-7 text-[#5F5967]">“{item.body}”</p><button type="button" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7454A6]"><Heart className="h-3.5 w-3.5" />I relate</button></article>)}</div><div className="mt-6 rounded-[20px] border border-[#292630]/10 bg-white p-4"><textarea id="reply-box" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Share your perspective respectfully…" maxLength={2000} className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-[#958F9B]" /><div className="flex items-center justify-between border-t border-[#292630]/10 pt-3"><span className="text-xs text-[#958F9B]">Anonymous to other users</span><button type="button" onClick={() => void postReply()} disabled={!reply.trim()} className="inline-flex items-center gap-2 rounded-full bg-[#7454A6] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-45">Post anonymously <Send className="h-4 w-4" /></button></div></div></section><Link href="/discover" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">Explore more answers <ArrowRight className="h-4 w-4" /></Link></> : null}</main></div>;
}
