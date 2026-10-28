'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, X } from 'lucide-react';
import { askFinanceController, type FinanceChatMessage } from '@/lib/finance-api';

const prompts = ['Which customers owe me the most money?', 'What should I review today?', 'Are my upcoming bills covered?'];

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
      setMessages([...nextMessages, { role: 'assistant', content: response.answer }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The controller could not answer right now.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="fixed inset-0 z-[120] flex items-end justify-end bg-[#0A1125]/55 backdrop-blur-sm sm:inset-auto sm:bottom-24 sm:right-6 sm:bg-transparent sm:backdrop-blur-none"><section role="dialog" aria-modal="true" aria-labelledby="controller-chat-title" className="flex h-[100dvh] w-full flex-col bg-white text-[#111B33] shadow-2xl sm:h-[min(680px,calc(100vh-8rem))] sm:w-[min(440px,calc(100vw-3rem))] sm:rounded-2xl sm:border sm:border-[#111B33]/10"><header className="flex items-start justify-between border-b border-[#111B33]/10 bg-[#111B33] p-5 text-white sm:rounded-t-2xl"><div><div className="flex items-center gap-2 text-[#C9F45D]"><Sparkles className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.14em]">Financial controller</p></div><h2 id="controller-chat-title" className="mt-2 text-xl font-black tracking-[-.04em]">What should we look at?</h2><p className="mt-1 text-xs text-white/55">Answers are grounded in your saved records.</p></div><button type="button" onClick={onClose} aria-label="Close financial controller" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"><X className="h-4 w-4" /></button></header><div className="flex-1 overflow-y-auto p-5"><div className="rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-4"><p className="text-sm font-black">Ask about your business finances.</p><p className="mt-2 text-xs leading-5 text-[#52628F]">The controller uses recorded transactions, accounts, customer balances, supplier bills, and findings. It will say when the records are incomplete.</p></div>{messages.length === 0 && <><p className="mt-6 text-[10px] font-black uppercase tracking-[.12em] text-[#758096]">Try asking</p><div className="mt-3 grid gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-xl border border-[#111B33]/10 px-3 py-3 text-left text-xs font-bold text-[#46516A] transition hover:border-[#3157F5]/30 hover:bg-[#F8F9FC]">{prompt}<ArrowRight className="float-right mt-0.5 h-3.5 w-3.5 text-[#3157F5]" /></button>)}</div></>}{messages.length > 0 && <div className="mt-5 grid gap-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-8 bg-[#111B33] text-white' : 'mr-4 border border-[#111B33]/10 bg-[#F8F9FC] text-[#46516A]'}`}><p className="mb-1 text-[9px] font-black uppercase tracking-[.1em] opacity-60">{message.role === 'user' ? 'You' : 'Dorah'}</p>{message.content}</div>)}{loading && <div className="mr-4 rounded-xl border border-[#111B33]/10 bg-[#F8F9FC] p-3 text-xs text-[#758096]">Reviewing your saved records…</div>}</div>}{error && <p role="alert" className="mt-4 rounded-lg border border-[#E8B4AD] bg-[#FFF4F2] p-3 text-xs leading-5 text-[#8E3329]">{error}</p>}</div><form onSubmit={submit} className="border-t border-[#111B33]/10 p-4"><label className="flex items-center gap-2 rounded-xl border border-[#111B33]/15 bg-[#F8F9FC] px-3 focus-within:border-[#3157F5]"><MessageCircle className="h-4 w-4 shrink-0 text-[#758096]" /><input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={loading} placeholder="Ask about your business finances…" className="h-11 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#9AA3B5]" /><button type="submit" disabled={loading || !question.trim()} aria-label="Send question" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#3157F5] text-white disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button></label><p className="mt-2 text-[10px] leading-4 text-[#758096]">Answers use recorded data, not guesses.</p></form></section></div>;
}
