'use client';

import Link from 'next/link';
import { FormEvent, Fragment, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, X } from 'lucide-react';
import { askFinanceController, type FinanceChatChart, type FinanceChatMessage } from '@/lib/finance-api';

const prompts = ['Which customers owe me the most money?', 'What should I review today?', 'Are my upcoming bills covered?'];

function formatFinanceText(value: string) {
  return value.replace(/(₦|NGN|USD|GHS|KES|ZAR)\s*([\d,]+(?:\.\d{1,2})?)/g, (_, currency: string, amount: string) => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(numericAmount)) return `${currency} ${amount}`;
    return `${currency} ${numericAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  });
}

function FinanceChart({ chart }: { chart: FinanceChatChart }) {
  const values = chart.values.map((value) => Number(value));
  const maxValue = Math.max(1, ...values);
  return <div className="mt-3 rounded-lg border border-[#111B33]/10 bg-white/70 p-3">
    <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">{chart.title}</p>
    <div className="mt-3 grid grid-cols-1 gap-2">
      {chart.labels.map((label, index) => <div key={`${label}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[10px]">
        <div className="min-w-0"><div className="truncate font-bold text-[#46516A]">{label}</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E8ECF5]"><div className="h-full rounded-full bg-[#3157F5]" style={{ width: `${Math.max(4, (values[index] || 0) / maxValue * 100)}%` }} /></div></div>
        <strong className="text-[#111B33]">{Number(values[index] || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}</strong>
      </div>)}
    </div>
  </div>;
}

function RichFinanceMessage({ content, chart }: { content: string; chart?: FinanceChatChart | null }) {
  const lines = formatFinanceText(content).split(/\r?\n/);
  return <div className="grid gap-1.5">
    {lines.map((line, index) => {
      if (!line.trim()) return <div key={`space-${index}`} className="h-1" />;
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      const isListItem = /^(?:\d+[.)]|[-•])\s/.test(line.trim());
      return <p key={`line-${index}`} className={isListItem ? 'pl-1' : undefined}>
        {parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**')
          ? <strong key={partIndex} className="font-black text-[#111B33]">{part.slice(2, -2)}</strong>
          : <Fragment key={partIndex}>{part}</Fragment>)}
      </p>;
    })}
    {chart && <FinanceChart chart={chart} />}
  </div>;
}

export default function IntelligenceChat({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<FinanceChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = question.trim();
    if (!content || loading || !businessId) return;
    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setQuestion('');
    setError('');
    setLoading(true);
    try {
      const response = await askFinanceController(businessId, content, messages);
      setMessages([...nextMessages, { role: 'assistant', content: response.answer, chart: response.chart }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The controller could not answer right now.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="fixed inset-0 z-[120] flex items-end justify-end bg-[#0A1125]/55 backdrop-blur-sm sm:inset-auto sm:bottom-24 sm:right-6 sm:bg-transparent sm:backdrop-blur-none"><section role="dialog" aria-modal="true" aria-labelledby="controller-chat-title" className="flex h-[100dvh] w-full flex-col bg-white text-[#111B33] shadow-2xl sm:h-[min(680px,calc(100vh-8rem))] sm:w-[min(440px,calc(100vw-3rem))] sm:rounded-2xl sm:border sm:border-[#111B33]/10"><header className="flex items-start justify-between border-b border-[#111B33]/10 bg-[#111B33] p-5 text-white sm:rounded-t-2xl"><div><div className="flex items-center gap-2 text-[#C9F45D]"><Sparkles className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.14em]">Financial controller</p></div><h2 id="controller-chat-title" className="mt-2 text-xl font-black tracking-[-.04em]">What should we look at?</h2><p className="mt-1 text-xs text-white/55">Answers are grounded in your saved records.</p></div><button type="button" onClick={onClose} aria-label="Close financial controller" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"><X className="h-4 w-4" /></button></header><div className="flex-1 overflow-y-auto p-5">{messages.length === 0 && <><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#758096]">Try asking</p><div className="mt-3 grid gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-xl border border-[#111B33]/10 px-3 py-3 text-left text-xs font-bold text-[#46516A] transition hover:border-[#3157F5]/30 hover:bg-[#F8F9FC]">{prompt}<ArrowRight className="float-right mt-0.5 h-3.5 w-3.5 text-[#3157F5]" /></button>)}</div></>}{messages.length > 0 && <div className="grid gap-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-xl p-2.5 text-sm leading-5 ${message.role === 'user' ? 'ml-8 bg-[#111B33] text-white' : 'mr-4 border border-[#111B33]/10 bg-[#F8F9FC] text-[#46516A]'}`}><p className="mb-1 text-[9px] font-black uppercase tracking-[.1em] opacity-60">{message.role === 'user' ? 'You' : 'Dorah'}</p>{message.role === 'assistant' ? <RichFinanceMessage content={message.content} chart={message.chart} /> : message.content}</div>)}{loading && <div className="mr-4 rounded-xl border border-[#111B33]/10 bg-[#F8F9FC] p-2.5 text-xs text-[#758096]">Reviewing your saved records…</div>}</div>}{error && <div role="alert" className="mt-4 rounded-lg border border-[#E8B4AD] bg-[#FFF4F2] p-3 text-xs leading-5 text-[#8E3329]"><p>{error}</p>{/plan limit|upgrade your plan/i.test(error) && <Link href="/pricing" className="mt-2 inline-flex rounded-lg bg-[#3157F5] px-3 py-2 text-[10px] font-black text-white">View upgrade plans</Link>}</div>}</div><form onSubmit={submit} className="border-t border-[#111B33]/10 p-4"><label className="flex items-center gap-2 rounded-xl border border-[#111B33]/15 bg-[#F8F9FC] px-3 focus-within:border-[#3157F5]"><MessageCircle className="h-4 w-4 shrink-0 text-[#758096]" /><input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={loading} placeholder="Ask about your business finances…" className="h-11 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#9AA3B5]" /><button type="submit" disabled={loading || !question.trim()} aria-label="Send question" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#3157F5] text-white disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button></label><p className="mt-2 text-[10px] leading-4 text-[#758096]">Answers use recorded data, not guesses.</p></form></section></div>;
}
