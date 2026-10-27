'use client';

import Link from 'next/link';
import { ArrowRight, CircleAlert, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { FinanceInsight } from '@/lib/finance-api';

type Props = {
  findings: FinanceInsight[];
  openFindings: number;
  potentialImpact: string;
  hasLiveRecords: boolean;
  formatAmount: (amount: number) => string;
};

const sampleFindings: FinanceInsight[] = [
  {
    id: 'sample-overdue', severity: 'high', status: 'new', source: 'obligations',
    title: 'Large customer debt overdue', detail: 'A customer payment is past its recorded due date. Keep this money out of available cash until it is collected.',
    evidence_count: 1, impact_amount: '120000', action_label: 'Investigate receivables',
    suggestion: 'Confirm the due date and check whether a recent payment has not been recorded.', action_url: '/dashboard/receivables',
    evidence: [{ id: 'sample-debt', contact: 'ABC Stores', description: 'Wholesale order', due_date: 'Sample due date', balance: '120000' }],
  },
  {
    id: 'sample-spend', severity: 'review', status: 'new', source: 'transactions',
    title: 'Transport expenses increased', detail: 'Transport spending is 35% higher than the same number of days in the previous month, based on recorded expenses.',
    evidence_count: 2, impact_amount: '25000', action_label: 'Review expense activity',
    suggestion: 'Review the transactions behind the increase. It may reflect a one-off cost or a category that needs correction.', action_url: '/dashboard/transactions',
    evidence: [{ id: 'sample-current', description: 'Transport · current period', date: 'Current period', amount: '96000', period: 'current' }, { id: 'sample-previous', description: 'Transport · comparison period', date: 'Previous period', amount: '71000', period: 'previous' }],
  },
  {
    id: 'sample-payables', severity: 'review', status: 'planning', source: 'payables',
    title: 'Supplier obligations due this week', detail: 'Recorded supplier balances totaling ₦35,000 are due in the next 7 days. Compare the dates with recorded account balances and expected collections.',
    evidence_count: 1, impact_amount: '35000', action_label: 'Review upcoming bills',
    suggestion: 'Check the due date and account balance before scheduling payment.', action_url: '/dashboard/payables',
    evidence: [{ id: 'sample-bill', contact: 'Brightline Packaging', description: 'Packaging supplies', due_date: 'Sample due date', balance: '35000' }],
  },
  {
    id: 'sample-duplicate', severity: 'review', status: 'new', source: 'transactions',
    title: 'Possible duplicate expense', detail: 'Two recorded expenses share a date, amount, description, and counterparty. They may still be separate legitimate purchases.',
    evidence_count: 2, impact_amount: '0', action_label: 'Compare transactions',
    suggestion: 'Compare both records and supporting receipts before correcting either one.', action_url: '/dashboard/transactions',
    evidence: [{ id: 'sample-expense-a', description: 'Stock purchase · Shoprite supplies', date: 'Sample date', amount: '48500' }, { id: 'sample-expense-b', description: 'Stock purchase · Shoprite supplies', date: 'Sample date', amount: '48500' }],
  },
];

function sourceLabel(source: string) {
  if (source === 'obligations') return 'Customer balances';
  if (source === 'payables') return 'Supplier bills';
  return 'Transactions';
}

export default function IntelligenceSection({ findings, openFindings, potentialImpact, hasLiveRecords, formatAmount }: Props) {
  const visibleFindings = hasLiveRecords ? findings : sampleFindings;
  const count = hasLiveRecords ? openFindings : sampleFindings.length;
  const impact = hasLiveRecords ? Number(potentialImpact) : 180000;

  return <div className="grid gap-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Financial intelligence</p>
        <h1 className="mt-2 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">Financial Intelligence</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64708A]">Understand your numbers. Know what needs attention.</p>
      </div>
      {!hasLiveRecords && <span className="inline-flex rounded-full border border-[#3157F5]/15 bg-[#EEF1FF] px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#3157F5]">Sample preview</span>}
    </header>

    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-[#111B33]/10 bg-white p-5">
        <div className="flex items-center gap-2 text-[#3157F5]"><CircleAlert className="h-4 w-4" /><p className="text-xs font-bold">Needs attention</p></div>
        <strong className="mt-3 block text-3xl font-black tracking-[-.05em]">{count}</strong>
        <p className="mt-1 text-[10px] text-[#758096]">{hasLiveRecords ? 'Open findings from recorded data' : 'Illustrative open findings'}</p>
      </article>
      <article className="rounded-xl border border-[#111B33]/10 bg-white p-5">
        <div className="flex items-center gap-2 text-[#3157F5]"><ShieldCheck className="h-4 w-4" /><p className="text-xs font-bold">Potential impact</p></div>
        <strong className="mt-3 block text-3xl font-black tracking-[-.05em]">{formatAmount(impact)}</strong>
        <p className="mt-1 text-[10px] text-[#758096]">{hasLiveRecords ? 'Recorded exposure across supported findings; it may overlap.' : 'Illustrative total across sample findings.'}</p>
      </article>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <section className="grid content-start gap-3">
        <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Priority findings</p><h2 className="mt-1 text-xl font-black">What needs a closer look?</h2></div><span className="text-[10px] text-[#758096]">{hasLiveRecords ? 'Rule-based checks' : 'Examples only'}</span></div>
        {visibleFindings.length ? visibleFindings.map((finding) => <article key={finding.id} className={`rounded-xl border p-5 ${finding.severity === 'high' ? 'border-[#E8D89F] bg-[#FFF9E8]' : 'border-[#111B33]/10 bg-white'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[9px] font-black uppercase tracking-[.1em] text-[#758096]">{sourceLabel(finding.source)}{finding.period_start && finding.period_end ? ` · ${finding.period_start} to ${finding.period_end}` : ''}</p><h3 className="mt-2 text-base font-black sm:text-lg">{finding.title}</h3></div>
            <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${finding.severity === 'high' ? 'bg-[#F9E8B8] text-[#765A14]' : 'bg-[#EEF1FF] text-[#3157F5]'}`}>{finding.severity === 'high' ? 'High priority' : finding.status === 'planning' ? 'Planning' : 'Review'}</span>
          </div>
          {Number(finding.impact_amount ?? 0) > 0 && <p className="mt-3 text-xl font-black tracking-[-.04em]">{formatAmount(Number(finding.impact_amount))}</p>}
          <p className="mt-2 text-xs leading-5 text-[#64708A]">{finding.detail}</p>
          {finding.evidence?.length ? <div className="mt-4 grid gap-2">{finding.evidence.slice(0, 4).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/75 px-3 py-2 text-[10px]"><span className="min-w-0"><strong className="text-[#111B33]">{item.contact || item.counterparty || item.description}</strong>{item.contact && <span className="ml-2 text-[#758096]">{item.description}</span>}<small className="ml-2 text-[#758096]">{item.due_date ? `Due ${item.due_date}` : item.date || ''}{item.period ? ` · ${item.period} period` : ''}</small></span>{(item.balance || item.amount) && <strong className="text-[#111B33]">{formatAmount(Number(item.balance ?? item.amount))}</strong>}</div>)}</div> : null}
          {finding.suggestion && <div className="mt-4 border-l-2 border-[#3157F5]/30 pl-3"><p className="text-[9px] font-black uppercase tracking-[.1em] text-[#3157F5]">Suggested next step</p><p className="mt-1 text-xs leading-5 text-[#64708A]">{finding.suggestion}</p></div>}
          <Link href={finding.action_url} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">{finding.action_label || 'Investigate'} <ArrowRight className="h-4 w-4" /></Link>
        </article>) : <div className="rounded-xl border border-[#111B33]/10 bg-white p-8 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-[#557516]" /><h3 className="mt-3 text-sm font-black">No supported findings right now</h3><p className="mt-2 text-xs leading-5 text-[#758096]">As records change, this page will show rule-based checks that need attention.</p></div>}
      </section>

      <aside className="grid content-start gap-4">
        <section className="rounded-xl border border-[#111B33] bg-[#111B33] p-5 text-white">
          <div className="flex items-center gap-2 text-[#C9F45D]"><Sparkles className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.12em]">Ask your financial controller</p></div>
          <h2 className="mt-3 text-xl font-black">Ask about your business</h2>
          <p className="mt-2 text-xs leading-5 text-white/60">Answers will use calculated figures from your saved records and show the evidence behind them.</p>
          <label className="mt-5 flex items-center gap-2 rounded-lg border border-white/15 bg-white/[.05] px-3"><Search className="h-4 w-4 shrink-0 text-white/45" /><input disabled placeholder="Business questions are coming soon" className="h-11 min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-white/40 outline-none disabled:cursor-not-allowed" /></label>
          <div className="mt-4 grid gap-2">{['How much do customers owe me?', 'What bills are due this week?', 'Why did expenses increase?'].map((question) => <p key={question} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/50">{question}</p>)}</div>
          <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-5 text-white/45">Financial figures come from application rules. AI answers are not active yet.</p>
        </section>
      </aside>
    </div>
    {!hasLiveRecords && <p className="text-[10px] leading-5 text-[#758096]">Illustrative interface only. Sample findings and amounts are examples, not live financial data.</p>}
  </div>;
}
