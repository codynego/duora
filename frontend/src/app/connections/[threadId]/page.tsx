'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';

type Message = { id: string; body: string; created_at: string; is_you: boolean; sender: { name: string; initial: string } };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function ConnectionThreadPage({ params }: { params: { threadId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]); const [body, setBody] = useState(''); const [error, setError] = useState('');
  async function load() { const token = await getAccessToken(); if (!token) return setError('Sign in to open this private thread.'); const response = await fetch(`${api}/api/v1/connections/threads/${params.threadId}/messages/`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json(); if (!response.ok) return setError(data.detail ?? 'This thread is unavailable.'); setMessages(data.data ?? []); }
  useEffect(() => { void load(); }, []);
  async function send(event: FormEvent) { event.preventDefault(); if (!body.trim()) return; const token = await getAccessToken(); if (!token) return; const response = await fetch(`${api}/api/v1/connections/threads/${params.threadId}/messages/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) }); const data = await response.json(); if (!response.ok) return setError(data.detail ?? 'Message could not be sent.'); setMessages((current) => [...current, data.data]); setBody(''); }
  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav /><main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-28 pt-7 sm:px-8 md:pb-8"><Link href="/connections" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"><ArrowLeft className="h-4 w-4" /> Connections</Link><header className="mt-7 border-b border-dark-950/10 pb-5"><p className="section-label">Private thread</p><h1 className="mt-2 text-2xl font-bold tracking-[-.05em]">A conversation you both chose.</h1></header><section className="flex-1 space-y-3 py-6">{error && <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-spark-coral">{error}</p>}{!error && !messages.length && <p className="py-10 text-center text-sm text-[#6F6470]">No messages yet. Start gently.</p>}{messages.map((message) => <div key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.is_you ? 'ml-auto bg-dark-950 text-white' : 'bg-white ring-1 ring-dark-950/10'}`}><p className={`mb-1 text-[11px] font-bold ${message.is_you ? 'text-white/60' : 'text-[#6F6470]'}`}>{message.is_you ? 'You' : message.sender.name}</p>{message.body}</div>)}</section><form onSubmit={send} className="sticky bottom-0 flex gap-2 border-t border-dark-950/10 bg-[#fffdfc] py-4"><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Write a message…" className="min-w-0 flex-1 rounded-full border border-dark-950/15 bg-white px-4 py-3 text-sm outline-none focus:border-spark-coral" /><button className="grid h-11 w-11 place-items-center rounded-full bg-dark-950 text-white" aria-label="Send message"><Send className="h-4 w-4" /></button></form></main></div>;
}
