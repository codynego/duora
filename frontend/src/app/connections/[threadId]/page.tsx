'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Smile, X } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';

type Message = { id: string; body: string; created_at: string; is_you: boolean; sender: { name: string; initial: string } };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
const emojis = ['🙂', '😊', '😂', '🥹', '😍', '😘', '😌', '😮', '😢', '😤', '❤️', '💕', '✨', '🔥', '🎉', '👏', '🙏', '👍', '👀', '🤝', '☕', '🌙', '🌻', '🎵', '🎮', '🍿', '💭', '🫶', '💯', '🚀'];

export default function ConnectionThreadPage({ params }: { params: { threadId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const typingSent = useRef(false);
  const lastTypingSignal = useRef(0);

  async function tokenHeaders() { const token = await getAccessToken(); return token ? { Authorization: `Bearer ${token}` } : null; }
  async function load() {
    const headers = await tokenHeaders();
    if (!headers) return setError('Sign in to open this private thread.');
    const [messagesResponse, typingResponse] = await Promise.all([fetch(`${api}/api/v1/connections/threads/${params.threadId}/messages/`, { headers }), fetch(`${api}/api/v1/connections/threads/${params.threadId}/typing/`, { headers })]);
    const data = await messagesResponse.json();
    if (!messagesResponse.ok) return setError(data.detail ?? 'This thread is unavailable.');
    setMessages((current) => { const pending = current.filter((message) => message.id.startsWith('pending-')); const received = data.data ?? []; return [...received, ...pending.filter((message) => !received.some((saved: Message) => saved.is_you && saved.body === message.body))]; });
    if (typingResponse.ok) setTypingNames((await typingResponse.json()).data ?? []);
  }
  async function setTyping(isTyping: boolean, force = false) {
    if (!force && isTyping === typingSent.current && Date.now() - lastTypingSignal.current < 2_000) return;
    const headers = await tokenHeaders(); if (!headers) return;
    typingSent.current = isTyping; lastTypingSignal.current = Date.now();
    void fetch(`${api}/api/v1/connections/threads/${params.threadId}/typing/`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ is_typing: isTyping }) });
  }
  useEffect(() => { void load(); const refresh = window.setInterval(() => void load(), 800); return () => { window.clearInterval(refresh); void setTyping(false, true); }; }, []);
  function updateBody(nextBody: string) { setBody(nextBody); void setTyping(Boolean(nextBody.trim())); }
  function addEmoji(emoji: string) { updateBody(`${body}${emoji}`); setPickerOpen(false); }
  async function send(event: FormEvent) {
    event.preventDefault(); const messageBody = body.trim(); if (!messageBody || sending) return;
    const headers = await tokenHeaders(); if (!headers) return;
    const pendingId = `pending-${Date.now()}`; const pending: Message = { id: pendingId, body: messageBody, created_at: new Date().toISOString(), is_you: true, sender: { name: 'You', initial: 'Y' } };
    setMessages((current) => [...current, pending]); updateBody(''); void setTyping(false, true); setSending(true);
    try { const response = await fetch(`${api}/api/v1/connections/threads/${params.threadId}/messages/`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ body: messageBody }) }); const data = await response.json(); if (!response.ok) throw new Error(data.detail ?? 'Message could not be sent.'); setMessages((current) => current.map((message) => message.id === pendingId ? data.data : message)); } catch (reason) { setMessages((current) => current.filter((message) => message.id !== pendingId)); setError(reason instanceof Error ? reason.message : 'Message could not be sent.'); } finally { setSending(false); }
  }
  const typingLabel = typingNames.length === 1 ? `${typingNames[0]} is typing` : `${typingNames.join(' and ')} are typing`;
  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav /><main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-28 pt-7 sm:px-8 md:pb-8"><Link href="/connections" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"><ArrowLeft className="h-4 w-4" /> Connections</Link><header className="mt-7 border-b border-dark-950/10 pb-5"><p className="section-label">Private conversation</p><h1 className="mt-2 text-2xl font-bold tracking-[-.05em]">Your shared conversation.</h1></header><section className="flex-1 space-y-3 py-6">{error && <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-spark-coral">{error}</p>}{!error && !messages.length && <p className="py-10 text-center text-sm text-[#6F6470]">No messages yet. Start gently.</p>}{messages.map((message) => <div key={message.id} className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.is_you ? 'ml-auto bg-dark-950 text-white' : 'bg-white ring-1 ring-dark-950/10'}`}><p className={`mb-1 text-[11px] font-bold ${message.is_you ? 'text-white/60' : 'text-[#6F6470]'}`}>{message.is_you ? 'You' : message.sender.name}</p>{message.body}</div>)}{typingNames.length > 0 && <div aria-live="polite" className="flex items-center gap-2 px-1 text-xs font-bold text-[#806e7d]"><span className="flex items-center gap-1 rounded-full bg-[#fff0f3] px-3 py-2"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-spark-coral" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-spark-coral [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-spark-coral [animation-delay:240ms]" /></span>{typingLabel}…</div>}</section><form onSubmit={send} className="sticky bottom-0 border-t border-dark-950/10 bg-[#fffdfc] py-4">{pickerOpen && <div className="mb-3 rounded-2xl border border-dark-950/10 bg-white p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold text-[#6F6470]">Pick an emoji</p><button type="button" onClick={() => setPickerOpen(false)} className="rounded-full p-1 text-[#6F6470]" aria-label="Close emoji picker"><X className="h-4 w-4" /></button></div><div className="grid grid-cols-10 gap-1">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => addEmoji(emoji)} className="grid aspect-square place-items-center rounded-lg text-xl transition hover:bg-[#fff0f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-spark-coral" aria-label={`Add ${emoji}`}>{emoji}</button>)}</div></div>}<div className="flex gap-2"><button type="button" onClick={() => setPickerOpen((open) => !open)} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${pickerOpen ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/15 bg-white text-[#6F6470] hover:text-dark-950'}`} aria-label="Choose an emoji" aria-expanded={pickerOpen}><Smile className="h-5 w-5" /></button><input value={body} onChange={(event) => updateBody(event.target.value)} onBlur={() => void setTyping(false, true)} maxLength={2000} placeholder="Write a message…" className="min-w-0 flex-1 rounded-full border border-dark-950/15 bg-white px-4 py-3 text-sm outline-none focus:border-spark-coral" /><button disabled={sending || !body.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-dark-950 text-white transition hover:bg-dark-950/85 disabled:opacity-50" aria-label="Send message"><Send className="h-4 w-4" /></button></div></form></main></div>;
}
