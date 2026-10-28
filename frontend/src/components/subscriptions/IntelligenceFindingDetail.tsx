'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CircleAlert, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import type { FinanceInsight } from '@/lib/finance-api';

type Props = {
  findingId: string;
  findings: FinanceInsight[];
  hasLiveRecords: boolean;
  formatAmount: (amount: number) => string;
};

const sampleFindings: FinanceInsight[] = [
  { id: 'sample-cash', severity: 'high', status: 'new', source: 'payables', title: 'Cash shortfall risk', detail: 'Your recorded cash may not cover upcoming supplier payments.', evidence_count: 2, impact_amount: '70000', action_label: 'Review evidence', suggestion: 'Review overdue receivables and confirm which supplier payments must be made first.', action_url: '/dashboard/cash-accounts', evidence: [{ id: 'cash', description: 'Recorded cash', amount: '320000' }, { id: 'due', description: 'Supplier payments due', amount: '250000' }] },
  { id: 'sample-duplicate', severity: 'review', status: 'new', source: 'transactions', title: 'Possible duplicate payment', detail: 'Two transactions appear similar in amount, date and description. Confirm whether both payments were genuine.', evidence_count: 2, impact_amount: '0', action_label: 'Compare the records', suggestion: 'Compare the original records and supporting receipts before correcting either one.', action_url: '/dashboard/transactions', evidence: [{ id: 'duplicate-a', description: 'Payment entry A', date: 'Oct 28, 2026', amount: '18500' }, { id: 'duplicate-b', description: 'Payment entry B', date: 'Oct 28, 2026', amount: '18500' }] },
  { id: 'sample-overdue', severity: 'high', status: 'new', source: 'obligations', title: 'Overdue customer debts', detail: 'Several customer balances remain unpaid beyond their recorded due dates.', evidence_count: 1, impact_amount: '120000', action_label: 'Review overdue customers', suggestion: 'Confirm the due dates and follow up with the customers whose balances are still open.', action_url: '/dashboard/receivables', evidence: [{ id: 'debt', contact: 'ABC Stores', description: 'Wholesale order', due_date: 'Past due', balance: '120000' }] },
  { id: 'sample-spend', severity: 'review', status: 'planning', source: 'transactions', title: 'Transport spending has increased', detail: 'Recorded transport expenses are 35% higher than the same number of days in the previous month.', evidence_count: 2, impact_amount: '25000', action_label: 'Review expense activity', suggestion: 'Review the transactions behind the increase. It may reflect a one-off cost or a category that needs correction.', action_url: '/dashboard/transactions', evidence: [{ id: 'current', description: 'Transport · current period', amount: '96000', period: 'current' }, { id: 'previous', description: 'Transport · comparison period', amount: '71000', period: 'previous' }] },
];

function sourceLabel(source: string) {
  return source === 'obligations' ? 'Customer balances' : source === 'payables' ? 'Supplier bills' : 'Transactions';
}

function statusLabel(status: string) {
  return status === 'resolved' ? 'Resolved' : status === 'new' ? 'Needs attention' : 'Under review';
}

export default function IntelligenceFindingDetail({ findingId, findings, hasLiveRecords, formatAmount }: Props) {
  const finding = (hasLiveRecords ? findings : sampleFindings).find((item) => item.id === findingId);

  if (!finding) {
    return <section className="rounded-2xl border border-[#111B33]/10 bg-white p-8 text-center"><CircleAlert className="mx-auto h-7 w-7 text-[#D6A928]" /><h1 className="mt-3 text-xl font-black">Finding not found</h1><p className="mt-2 text-sm text-[#64708A]">This finding may have been resolved or is no longer available.</p><Link href="/dashboard/intelligence" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]"><ArrowLeft className="h-4 w-4" />Back to Intelligence</Link></section>;
  }

  const isHigh = finding.severity === 'high';
  return <div className="grid gap-5">
    <Link href="/dashboard/intelligence" className="inline-flex w-fit items-center gap-2 text-xs font-black text-[#64708A] hover:text-[#3157F5]"><ArrowLeft className="h-4 w-4" />Back to findings</Link>

    <header className={`relative overflow-hidden rounded-2xl border p-5 sm:p-8 ${isHigh ? 'border-[#E8D89F] bg-[#FFF9E8]' : 'border-[#111B33]/10 bg-white'}`}>
      <span className={`absolute inset-y-0 left-0 w-1.5 ${isHigh ? 'bg-[#D6A928]' : 'bg-[#3157F5]'}`} aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-4 pl-2"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{sourceLabel(finding.source)} · Finding detail</p><h1 className="mt-3 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-6xl">{finding.title}<span className="text-[#3157F5]">.</span></h1></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${isHigh ? 'bg-[#F9E8B8] text-[#765A14]' : 'bg-[#EEF1FF] text-[#3157F5]'}`}>{isHigh ? 'High priority' : 'Review soon'}</span><span className="rounded-full border border-[#111B33]/10 bg-white/70 px-3 py-1.5 text-[10px] font-black text-[#64708A]">{statusLabel(finding.status)}</span></div></div>
      <p className="mt-5 max-w-3xl pl-2 text-base leading-7 text-[#46516A] sm:text-lg">{finding.detail}</p>
      {!hasLiveRecords && <p className="mt-5 border-t border-[#111B33]/10 pt-4 text-[10px] font-bold text-[#758096]">Illustrative finding · sample amounts are not live financial data.</p>}
    </header>

    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-2xl border border-[#111B33]/10 bg-white p-5 sm:p-7" aria-labelledby="evidence-heading"><div className="flex items-center gap-2 text-[#3157F5]"><FileSearch className="h-5 w-5" /><p className="text-[10px] font-black uppercase tracking-[.14em]">Evidence trail</p></div><h2 id="evidence-heading" className="mt-3 text-2xl font-black tracking-[-.05em]">What led to this finding?</h2><p className="mt-2 text-sm leading-6 text-[#64708A]">These are the records and comparisons currently supporting the review. Evidence is shown so you can verify the finding in context.</p><div className="mt-5 divide-y divide-[#111B33]/10 rounded-xl border border-[#111B33]/10">{finding.evidence?.length ? finding.evidence.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><strong className="block text-sm">{item.contact || item.description}</strong><p className="mt-1 text-[10px] text-[#758096]">{item.description}{item.date ? ` · ${item.date}` : ''}{item.due_date ? ` · Due ${item.due_date}` : ''}</p></div><strong className="text-sm">{item.balance || item.amount ? formatAmount(Number(item.balance ?? item.amount)) : 'Recorded'}</strong></div>) : <p className="p-5 text-sm text-[#758096]">The supporting records are not available in this view.</p>}</div><p className="mt-4 text-[10px] leading-5 text-[#758096]">{finding.evidence_count} record{finding.evidence_count === 1 ? '' : 's'} referenced · {finding.period_start && finding.period_end ? `${finding.period_start} to ${finding.period_end}` : 'Current saved records'}</p></section>

      <aside className="grid content-start gap-4"><section className="rounded-2xl border border-[#3157F5]/20 bg-[#EEF1FF] p-5 sm:p-6" aria-labelledby="action-heading"><div className="flex items-center gap-2 text-[#3157F5]"><Sparkles className="h-5 w-5" /><p className="text-[10px] font-black uppercase tracking-[.14em]">Recommended next action</p></div><h2 id="action-heading" className="mt-3 text-xl font-black tracking-[-.04em]">{finding.action_label || 'Review the evidence'}</h2><p className="mt-3 text-sm leading-6 text-[#52628F]">{finding.suggestion || 'Open the related records, confirm what happened, and update the source record if anything is wrong.'}</p><Link href={finding.action_url} className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">Open related records <ArrowRight className="h-4 w-4" /></Link></section><section className="rounded-2xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><div className="flex items-center gap-2 text-[#557516]"><ShieldCheck className="h-5 w-5" /><p className="text-[10px] font-black uppercase tracking-[.14em]">What this does not prove</p></div><ul className="mt-4 grid gap-3">{['This is a review prompt, not a confirmed error.', 'The amount shown may be an estimate or may overlap with another finding.', 'Dorah cannot know what happened outside the records you entered.'].map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-[#64708A]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#557516]" />{item}</li>)}</ul></section></aside>
    </div>

    <section className="rounded-2xl border border-[#111B33] bg-[#111B33] p-5 text-white sm:p-7"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#C9F45D]">Controller’s note</p><h2 className="mt-3 text-2xl font-black tracking-[-.05em]">Verify the record, then decide.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Financial Intelligence helps you choose where to look first. It does not post entries, accuse a customer or supplier, or replace your judgement. The safest next step is to compare the evidence with the original receipt, invoice, payment record, or customer conversation.</p><Link href="/dashboard/intelligence" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#C9F45D]">Return to all findings <ArrowRight className="h-4 w-4" /></Link></section>
  </div>;
}
