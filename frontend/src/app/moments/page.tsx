'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, LockKeyhole } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';

type Moment = { id: string; kind: string; title: string; content: string; room_code: string | null; created_at: string };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void (async () => {
    const token = await getAccessToken();
    if (!token) { setLoading(false); return; }
    const response = await fetch(`${api}/api/v1/rooms/moments/`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    if (response.ok) setMoments(body.data ?? []);
    setLoading(false);
  })(); }, []);

  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav /><main className="mx-auto max-w-5xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14"><header className="border-b border-dark-950/10 pb-9"><p className="section-label">Moments</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Keep what mattered.</h1><p className="mt-3 max-w-xl text-base leading-7 text-[#6F6470]">Private notes and small reminders from experiences you chose to save. Nothing here is shared automatically.</p></header>{loading ? <p className="py-16 text-sm text-[#6F6470]">Opening your moments…</p> : moments.length ? <section className="mt-8 grid gap-4 sm:grid-cols-2">{moments.map((moment) => <article key={moment.id} className="rounded-[24px] border border-dark-950/10 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-spark-coral">{moment.kind.replace('_', ' ')}</p><h2 className="mt-2 text-lg font-bold tracking-[-.03em]">{moment.title}</h2></div><Bookmark className="h-4 w-4 text-dark-950/35" /></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#6F6470]">{moment.content}</p><p className="mt-5 text-xs text-dark-950/40">Saved {new Date(moment.created_at).toLocaleDateString()}</p></article>)}</section> : <section className="mt-9 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3] text-spark-coral"><LockKeyhole className="h-5 w-5" /></span><h2 className="mt-5 text-xl font-bold">Nothing saved yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">At the end of an experience, save a thought you would like to return to. It remains yours.</p><Link href="/discover" className="mt-6 inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Find an experience <ArrowRight className="h-4 w-4" /></Link></section>}</main></div>;
}
