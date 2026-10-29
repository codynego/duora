'use client';

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowRight, CircleAlert, MessageCircle, Pencil, Plus, Search, ShieldCheck, Trash2, WalletCards, X } from 'lucide-react';
import { createFinanceAccount, deleteFinanceObligation, type FinanceAccount, type FinanceContact, type FinanceObligation, type FinanceOverview, type FinanceWorkspace, updateFinanceObligation, updateFinanceTransaction, voidFinanceTransaction } from '@/lib/finance-api';
import type { CurrentUser } from '@/lib/current-user';
import DashboardProfileSection from './DashboardProfileSection';
import BusinessSettingsSection from './BusinessSettingsSection';
import IntelligenceSection from './IntelligenceSection';
import IntelligenceFindingDetail from './IntelligenceFindingDetail';

type PreviewTransaction = { transactionId?: string; date: string; dateKey?: string; time?: string; title: string; detail: string; amount: number; direction: 'in' | 'out' | 'transfer'; category?: string; accountId?: string | null; accountName?: string | null; contactId?: string | null; contactName?: string | null };
type Section = 'intelligence' | 'transactions' | 'cash-accounts' | 'receivables' | 'payables' | 'performance' | 'customers-suppliers' | 'profile' | 'settings';

const demoTransactions: PreviewTransaction[] = [
  { date: 'Oct 27', title: 'Shoprite supplies', detail: 'Stock purchase', amount: 86_500, direction: 'out' },
  { date: 'Oct 26', title: 'Amina Bello', detail: 'Customer payment', amount: 120_000, direction: 'in' },
  { date: 'Oct 25', title: 'Lagos Water', detail: 'Utility bill', amount: 18_000, direction: 'out' },
  { date: 'Oct 24', title: 'Walk-in sales', detail: 'Sales received', amount: 245_000, direction: 'in' },
];

function formatMoneyInputValue(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimals] = cleaned.split('.');
  const fraction = decimals.join('').slice(0, 2);
  const grouped = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction.length ? `${grouped || '0'}.${fraction}` : grouped;
}

function SampleTag() {
  return <span className="inline-flex items-center rounded-full border border-[#3157F5]/15 bg-[#EEF1FF] px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#3157F5]">Sample preview</span>;
}

function PageHeading({ eyebrow, title, description, sample = true }: { eyebrow: string; title: string; description: string; sample?: boolean }) {
  return <header className="flex min-w-0 flex-wrap items-end justify-between gap-4"><div className="min-w-0 max-w-full"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{eyebrow}</p><h1 className="mt-2 break-words font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl break-words text-sm leading-6 text-[#64708A]">{description}</p></div>{sample && <SampleTag />}</header>;
}

function Metric({ label, value, note, prominent = false }: { label: string; value: string; note: string; prominent?: boolean }) {
  return <article className={`min-w-0 rounded-xl border p-5 ${prominent ? 'border-[#3157F5] bg-[#3157F5] text-white' : 'border-[#111B33]/10 bg-white'}`}><p className={`break-words text-xs font-bold ${prominent ? 'text-white/70' : 'text-[#758096]'}`}>{label}</p><strong className="mt-3 block break-words text-2xl font-black tracking-[-.05em]">{value}</strong><p className={`mt-1 break-words text-[10px] ${prominent ? 'text-white/60' : 'text-[#758096]'}`}>{note}</p></article>;
}

function isOverdue(dueDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dueDate}T00:00:00`) < today;
}

function isDueWithinSevenDays(dueDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return due >= today && due <= new Date(today.getTime() + 7 * 86400000);
}

function timeInputValue(time?: string) {
  if (!time) return '';
  const parsed = new Date(`1970-01-01 ${time}`);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toTimeString().slice(0, 5);
}

function DataTable({ headers, rows, onRowClick }: { headers: string[]; rows: (string | number)[][]; onRowClick?: (index: number) => void }) {
  return <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-[#111B33]/10 text-[9px] font-black uppercase tracking-[.1em] text-[#758096]">{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-[#111B33]/[.08]">{rows.map((row, index) => <tr key={index} onClick={() => onRowClick?.(index)} className={`text-[#46516A] ${onRowClick ? 'cursor-pointer transition hover:bg-[#F8F9FC]' : ''}`}>{row.map((cell, cellIndex) => <td key={cellIndex} className={`max-w-[240px] break-words px-4 py-3.5 ${cellIndex === row.length - 1 ? 'font-bold text-[#111B33]' : ''}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function DateFilterBar({ fromDate, toDate, setFromDate, setToDate, label = 'Reporting period' }: { fromDate: string; toDate: string; setFromDate: (value: string) => void; setToDate: (value: string) => void; label?: string }) {
  const [preset, setPreset] = useState<DatePreset>(fromDate || toDate ? 'custom' : '30days');
  useEffect(() => {
    if (!fromDate && !toDate && preset === '30days') {
      const dates = presetDates('30days');
      setFromDate(dates.from);
      setToDate(dates.to);
    }
  }, [fromDate, toDate, preset, setFromDate, setToDate]);
  return <PresetDateFilter preset={preset} setPreset={(value) => { setPreset(value); const dates = presetDates(value); if (value !== 'custom') { setFromDate(dates.from); setToDate(dates.to); } }} label={label} customFrom={fromDate} customTo={toDate} setCustomFrom={setFromDate} setCustomTo={setToDate} />;
}

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom';

function localDateString(date: Date) {
  return date.toLocaleDateString('en-CA');
}

function presetDates(preset: DatePreset, customFrom = '', customTo = '') {
  if (preset.startsWith('custom:')) {
    const [, from, to] = preset.split(':');
    return { from: from || '', to: to || '' };
  }
  if (preset === 'custom') return { from: customFrom, to: customTo };
  if (preset === 'all') return { from: '', to: '' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preset === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { from: localDateString(yesterday), to: localDateString(yesterday) };
  }
  const days = preset === '7days' ? 6 : preset === '30days' ? 29 : 0;
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  return { from: localDateString(from), to: localDateString(today) };
}

function PresetDateFilter({ preset, setPreset, label, customFrom = '', customTo = '', setCustomFrom, setCustomTo }: { preset: DatePreset; setPreset: (value: DatePreset) => void; label: string; customFrom?: string; customTo?: string; setCustomFrom?: (value: string) => void; setCustomTo?: (value: string) => void }) {
  const options: Array<[DatePreset, string]> = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7days', 'Last 7 days'], ['30days', 'Last 30 days'], ['all', 'All time'], ['custom', 'Custom']];
  const isEncodedCustom = preset.startsWith('custom:');
  const isCustom = preset === 'custom' || isEncodedCustom;
  const [, encodedFrom = '', encodedTo = ''] = isEncodedCustom ? preset.split(':') : [];
  const from = customFrom || encodedFrom;
  const to = customTo || encodedTo;
  const updateFrom = setCustomFrom ?? ((value: string) => setPreset(`custom:${value}:${to}` as DatePreset));
  const updateTo = setCustomTo ?? ((value: string) => setPreset(`custom:${from}:${value}` as DatePreset));
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#111B33]/10 bg-white p-3 shadow-[0_4px_14px_rgba(17,27,51,.03)]"><span className="mr-1 text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">{label}</span>{options.map(([value, text]) => <button key={value} type="button" onClick={() => setPreset(value)} aria-pressed={preset === value || (value === 'custom' && isEncodedCustom)} className={`h-9 rounded-lg px-3 text-xs font-black transition ${preset === value || (value === 'custom' && isEncodedCustom) ? 'bg-[#3157F5] text-white' : 'border border-[#111B33]/10 text-[#64708A] hover:border-[#3157F5]/30 hover:text-[#3157F5]'}`}>{text}</button>)}{isCustom && <div className="flex flex-wrap items-end gap-2 basis-full pt-1"><label className="grid gap-1 text-[10px] font-bold text-[#64708A]">From<input aria-label={`${label} from date`} type="date" value={from} max={to || undefined} onChange={(event) => updateFrom(event.target.value)} className="h-9 rounded-lg border border-[#111B33]/10 bg-white px-2 text-xs font-normal text-[#111B33]" /></label><label className="grid gap-1 text-[10px] font-bold text-[#64708A]">To<input aria-label={`${label} to date`} type="date" value={to} min={from || undefined} onChange={(event) => updateTo(event.target.value)} className="h-9 rounded-lg border border-[#111B33]/10 bg-white px-2 text-xs font-normal text-[#111B33]" /></label></div>}</div>;
}

function Pagination({ page, setPage, total, pageSize = 10 }: { page: number; setPage: (page: number) => void; total: number; pageSize?: number }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return <div className="flex items-center justify-between border-t border-[#111B33]/10 px-4 py-3"><span className="text-[10px] font-bold text-[#758096]">Page {page} of {pages} · {total} records</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} className="h-8 rounded-md border border-[#111B33]/10 px-3 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={page === pages} onClick={() => setPage(Math.min(pages, page + 1))} className="h-8 rounded-md bg-[#111B33] px-3 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>;
}

type PerformanceInterval = 'daily' | 'weekly' | 'monthly';

function PerformanceSection({ fromDate, toDate, setFromDate, setToDate, interval, setInterval, workspace, hasLiveRecords, summary, formatAmount, transactions }: {
  fromDate: string; toDate: string; setFromDate: (value: string) => void; setToDate: (value: string) => void;
  interval: PerformanceInterval; setInterval: (value: PerformanceInterval) => void; workspace: FinanceWorkspace | null;
  hasLiveRecords: boolean; summary?: FinanceOverview['summary']; formatAmount: (amount: number) => string; transactions: PreviewTransaction[];
}) {
  const dailyRows = workspace?.performanceDaily?.length ? workspace.performanceDaily : transactions.reduce<Array<{ date: string; income: number; expenses: number; net: number }>>((rows, item) => {
    if (!item.dateKey || item.direction === 'transfer') return rows;
    const current = rows.find((row) => row.date === item.dateKey) ?? { date: item.dateKey, income: 0, expenses: 0, net: 0 };
    if (item.direction === 'in') current.income += item.amount;
    if (item.direction === 'out') current.expenses += item.amount;
    current.net = current.income - current.expenses;
    if (!rows.includes(current)) rows.push(current);
    return rows;
  }, []);
  const selectedRows = dailyRows.filter((item) => (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate));
  const totalIncome = fromDate || toDate ? selectedRows.reduce((sum, item) => sum + Number(item.income), 0) : (workspace?.performance ?? []).reduce((sum, item) => sum + Number(item.income), 0);
  const totalExpenses = fromDate || toDate ? selectedRows.reduce((sum, item) => sum + Number(item.expenses), 0) : (workspace?.performance ?? []).reduce((sum, item) => sum + Number(item.expenses), 0);
  const reportingLabel = fromDate || toDate ? (fromDate && toDate ? `${fromDate} to ${toDate}` : fromDate ? `From ${fromDate}` : `Through ${toDate}`) : 'All recorded history';
  const chartRows = useMemo(() => {
    if (!hasLiveRecords) return [];
    if (!fromDate && !toDate) return workspace?.performance ?? [];
    const grouped = new Map<string, { month: string; income: number; expenses: number; net: number }>();
    for (const item of selectedRows) {
      const date = new Date(`${item.date}T00:00:00`);
      let key = item.date;
      if (interval === 'weekly') {
        const day = date.getDay() || 7;
        date.setDate(date.getDate() - day + 1);
        key = date.toLocaleDateString('en-CA');
      } else if (interval === 'monthly') {
        key = item.date.slice(0, 7);
      }
      const current = grouped.get(key) ?? { month: key, income: 0, expenses: 0, net: 0 };
      current.income += Number(item.income); current.expenses += Number(item.expenses); current.net += Number(item.net);
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [fromDate, toDate, hasLiveRecords, interval, selectedRows, workspace?.performance]);
  const chartMax = Math.max(1, ...chartRows.flatMap((item) => [Number(item.income), Number(item.expenses)]));
  const selectedLabel = fromDate || toDate ? (interval === 'daily' ? 'Daily' : interval === 'weekly' ? 'Weekly' : 'Monthly') : 'Monthly';
  const displayDate = (value: string) => new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00`).toLocaleDateString('en', { month: 'short', day: value.length === 10 ? 'numeric' : undefined });
  return <div className="grid gap-6"><PageHeading eyebrow="Recorded results" title="Performance" description="Understand how your business is performing over time." sample={!hasLiveRecords} /><DateFilterBar fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} label="Reporting period" /><div className="grid gap-3 sm:grid-cols-2"><Metric label="Recorded sales" value={formatAmount(totalIncome || (hasLiveRecords ? 0 : Number(summary?.income_this_month ?? 940_000)))} note={reportingLabel} /><Metric label="Recorded expenses" value={formatAmount(totalExpenses || (hasLiveRecords ? 0 : Number(summary?.expenses_this_month ?? 1_140_000)))} note={reportingLabel} /></div><section className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Sales vs expenses</h2><p className="mt-1 text-xs text-[#758096]">{hasLiveRecords ? `${selectedLabel} recorded figures · ${reportingLabel}` : 'Illustrative monthly figures'}</p></div>{hasLiveRecords && <div className="flex items-center gap-1 rounded-lg border border-[#111B33]/10 p-1">{(['daily', 'weekly', 'monthly'] as PerformanceInterval[]).map((value) => <button key={value} type="button" onClick={() => setInterval(value)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-black capitalize ${interval === value ? 'bg-[#111B33] text-white' : 'text-[#64708A]'}`}>{value}</button>)}</div>}{!hasLiveRecords && <SampleTag />}</div>{hasLiveRecords && chartRows.length ? <div className="mt-7 flex h-56 items-end gap-3 overflow-x-auto border-b border-l border-[#111B33]/10 px-3 pb-2">{chartRows.map((item) => <div key={item.month} className="flex h-full min-w-[30px] flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><span className="w-3 rounded-t-sm bg-[#3157F5]" style={{ height: `${Number(item.income) / chartMax * 100}%` }} /><span className="w-3 rounded-t-sm bg-[#C9F45D]" style={{ height: `${Number(item.expenses) / chartMax * 100}%` }} /></div><span className="text-[9px] font-bold text-[#758096]">{displayDate(item.month)}</span></div>)}</div> : <div className="mt-7 grid h-56 grid-cols-3 items-end gap-3 border-b border-l border-[#111B33]/10 px-3 pb-2 sm:grid-cols-6" />}</section><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Profitability</p><strong className="mt-3 block text-2xl font-black">{formatAmount(totalIncome - totalExpenses)}</strong><p className="mt-1 text-xs text-[#758096]">Recorded sales less recorded expenses</p></article><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Cash flow</p><strong className="mt-3 block text-2xl font-black">{formatAmount(totalIncome - totalExpenses)}</strong><p className="mt-1 text-xs text-[#758096]">Money received less money paid in the selected period</p></article></div></div>;
}

export function TransactionDetailsModal({ businessId, transaction, accounts, formatAmount, onClose, onRefresh }: { businessId: string; transaction: PreviewTransaction; accounts: FinanceAccount[]; formatAmount: (amount: number) => string; onClose: () => void; onRefresh: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const live = Boolean(transaction.transactionId);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transaction.transactionId) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage('');
    try {
      await updateFinanceTransaction(businessId, transaction.transactionId, { description: String(form.get('description') ?? '').trim(), amount: String(form.get('amount') ?? '').trim().replace(/,/g, ''), occurred_on: String(form.get('occurred_on') ?? ''), occurred_at: String(form.get('occurred_at') ?? '') ? `${String(form.get('occurred_on') ?? '')}T${String(form.get('occurred_at') ?? '')}:00` : null, account: String(form.get('account') ?? '') || null });
      await onRefresh(); onClose();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update this transaction.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!transaction.transactionId) return;
    setBusy(true); setMessage('');
    try { await voidFinanceTransaction(businessId, transaction.transactionId, 'User removed transaction'); await onRefresh(); onClose(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove this transaction.'); setBusy(false); }
  }
  return <div className="fixed inset-0 z-[110] flex justify-end bg-[#0A1125]/60 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="transaction-details-title" className="h-full w-full max-w-lg overflow-y-auto border-l border-[#111B33]/15 bg-white shadow-2xl sm:rounded-l-2xl"><header className="flex items-start justify-between border-b border-[#111B33]/10 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Transaction details</p><h2 id="transaction-details-title" className="mt-2 text-2xl font-black tracking-[-.05em]">{formatAmount(transaction.amount)}</h2></div><button type="button" onClick={onClose} aria-label="Close transaction details" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9]"><X className="h-4 w-4" /></button></header>{editing ? <form onSubmit={save} className="grid gap-4 p-5"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Description<input name="description" required defaultValue={transaction.title} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Amount<input name="amount" type="number" min="0.01" step="0.01" required defaultValue={transaction.amount} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Date<input name="occurred_on" type="date" required defaultValue={transaction.dateKey} max={new Date().toLocaleDateString('en-CA')} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label></div><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Time<input name="occurred_at" type="time" defaultValue={timeInputValue(transaction.time)} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label>{accounts.length > 0 && <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Account<select name="account" defaultValue={transaction.accountId ?? ''} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-normal outline-none focus:border-[#3157F5]"><option value="">No account selected</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}{message && <p role="alert" className="text-xs text-[#A4362B]">{message}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="h-10 rounded-lg border border-[#111B33]/15 px-4 text-xs font-black">Cancel</button><button disabled={busy} className="h-10 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">{busy ? 'Saving…' : 'Save changes'}</button></div></form> : <div className="p-5"><div className="grid gap-3 text-sm"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Description</p><p className="mt-1 font-bold text-[#111B33]">{transaction.title}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Date and time</p><p className="mt-1 font-bold text-[#111B33]">{transaction.date}{transaction.time ? ` · ${transaction.time}` : ''}</p></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Status</p><p className="mt-1 font-bold text-[#557516]">Recorded</p></div></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Account or contact</p><p className="mt-1 font-bold text-[#111B33]">{transaction.accountName || transaction.contactName || transaction.detail || 'Not linked'}</p></div></div>{message && <p role="alert" className="mt-4 text-xs text-[#A4362B]">{message}</p>}{live && <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white"><Pencil className="h-3.5 w-3.5" />Edit transaction</button>{confirmDelete ? <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E8B4AD] bg-[#FFF4F2] p-2"><span className="text-[10px] font-bold text-[#8E3329]">Remove it from active calculations?</span><button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex h-8 items-center gap-1 rounded-md bg-[#A4362B] px-3 text-[10px] font-black text-white"><Trash2 className="h-3 w-3" />{busy ? 'Removing…' : 'Confirm'}</button><button type="button" onClick={() => setConfirmDelete(false)} className="h-8 px-2 text-[10px] font-black text-[#64708A]">Cancel</button></div> : <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#A4362B]/25 px-4 text-xs font-black text-[#A4362B]"><Trash2 className="h-3.5 w-3.5" />Delete / void</button>}</div>}<p className="mt-5 text-[10px] leading-5 text-[#758096]">Changes and removals are recorded in the business activity history. Linked payments restore the related outstanding balance when voided.</p></div>}</section></div>;
}

function LegacyContactDetailsDrawer({ contact, obligations, transactions, formatAmount, onClose }: { contact: FinanceContact; obligations: FinanceWorkspace['obligations']; transactions: PreviewTransaction[]; formatAmount: (amount: number) => string; onClose: () => void }) {
  const contactObligations = obligations.filter((item) => item.contact === contact.id);
  const contactTransactions = transactions.filter((item) => item.contactId === contact.id || (!item.contactId && item.contactName?.toLowerCase() === contact.name.toLowerCase()));
  const activityTransactions = contactTransactions.filter((item) => item.direction === (contact.kind === 'customer' ? 'in' : 'out'));
  const totalPaid = activityTransactions.reduce((sum, item) => sum + item.amount, 0);
  const openObligations = contactObligations.filter((item) => item.status !== 'settled');
  return <div className="fixed inset-0 z-[105] flex justify-end bg-[#0A1125]/60 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="contact-details-title" className="h-full w-full max-w-lg overflow-y-auto border-l border-[#111B33]/15 bg-white shadow-2xl sm:rounded-l-2xl"><header className="flex items-start justify-between border-b border-[#111B33]/10 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{contact.kind === 'customer' ? 'Customer details' : 'Supplier details'}</p><h2 id="contact-details-title" className="mt-2 text-2xl font-black tracking-[-.05em]">{contact.name}</h2><p className="mt-1 text-xs text-[#758096]">{contact.kind === 'customer' ? 'Money customers owe you' : 'Money you owe this supplier'}</p></div><button type="button" onClick={onClose} aria-label="Close contact details" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9]"><X className="h-4 w-4" /></button></header><div className="grid gap-5 p-5"><div className="grid gap-2 rounded-xl border border-[#111B33]/10 bg-[#F8F9FC] p-4 text-xs"><strong className="text-sm">Contact information</strong><span>{contact.email || 'No email saved'}</span><span>{contact.phone || 'No phone saved'}</span></div><div className="grid grid-cols-3 gap-2"><div className="rounded-xl border border-[#111B33]/10 bg-white p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#758096]">{contact.kind === 'customer' ? 'Jobs' : 'Bills'}</p><strong className="mt-2 block text-lg font-black">{activityTransactions.length}</strong><p className="mt-1 text-[9px] text-[#758096]">Linked records</p></div><div className="rounded-xl border border-[#111B33]/10 bg-white p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#758096]">{contact.kind === 'customer' ? 'Paid' : 'Paid out'}</p><strong className="mt-2 block text-sm font-black">{formatAmount(totalPaid)}</strong><p className="mt-1 text-[9px] text-[#758096]">Recorded to date</p></div><div className="rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#3157F5]">Still owed</p><strong className="mt-2 block text-sm font-black">{formatAmount(Number(contact.outstanding_balance))}</strong><p className="mt-1 text-[9px] text-[#758096]">Open balance</p></div></div><div className="rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Outstanding balance</p><strong className="mt-2 block text-2xl font-black">{formatAmount(Number(contact.outstanding_balance))}</strong></div><section><div className="flex items-center justify-between"><h3 className="text-sm font-black">Open balances</h3><span className="text-[10px] font-bold text-[#758096]">{openObligations.length}</span></div>{openObligations.length ? <div className="mt-3 grid gap-2">{openObligations.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#111B33]/10 p-3"><div className="min-w-0"><strong className="block truncate text-xs">{item.description}</strong><span className="text-[10px] text-[#758096]">{item.due_date ? `Due ${item.due_date}` : 'No due date'} · {item.status}</span></div><strong className="shrink-0 text-xs">{formatAmount(Number(item.balance))}</strong></div>)}</div> : <p className="mt-3 text-xs text-[#758096]">No open balances for this contact.</p>}</section><section><div className="flex items-center justify-between"><h3 className="text-sm font-black">Linked transactions</h3><span className="text-[10px] font-bold text-[#758096]">{contactTransactions.length}</span></div>{contactTransactions.length ? <div className="mt-3 divide-y divide-[#111B33]/10 rounded-lg border border-[#111B33]/10">{contactTransactions.map((item) => <div key={item.transactionId ?? `${item.date}-${item.title}`} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><strong className="block truncate text-xs">{item.title}</strong><span className="text-[10px] text-[#758096]">{item.date}{item.time ? ` · ${item.time}` : ''}</span></div><strong className={`shrink-0 text-xs ${item.direction === 'in' ? 'text-[#557516]' : 'text-[#111B33]'}`}>{item.direction === 'in' ? '+' : '−'}{formatAmount(item.amount)}</strong></div>)}</div> : <p className="mt-3 text-xs text-[#758096]">No linked transactions yet.</p>}</section></div></section></div>;
}

const countryDialCodes: Record<string, string> = { NG: '234', GH: '233', KE: '254', ZA: '27', US: '1', CA: '1', GB: '44', AU: '61', DE: '49', FR: '33', AE: '971', IN: '91' };

function whatsappNumber(phone: string, country: string) {
  const raw = phone.trim();
  if (!raw) return '';
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (raw.startsWith('+')) return digits;
  if (raw.startsWith('00')) return digits.slice(2);
  const dialCode = countryDialCodes[country.toUpperCase()] ?? countryDialCodes.NG;
  return digits.startsWith(dialCode) ? digits : `${dialCode}${digits.replace(/^0+/, '')}`;
}

function savedOwnerCountry() {
  if (typeof window === 'undefined') return 'NG';
  try { return JSON.parse(window.localStorage.getItem('dorah:financial-controller:onboarding') || '{}').country || 'NG'; } catch { return 'NG'; }
}

function ContactDetailsDrawer({ contact, obligations, transactions, formatAmount, onClose }: { contact: FinanceContact; obligations: FinanceWorkspace['obligations']; transactions: PreviewTransaction[]; formatAmount: (amount: number) => string; onClose: () => void }) {
  const contactObligations = obligations.filter((item) => item.contact === contact.id);
  const contactTransactions = transactions.filter((item) => item.contactId === contact.id || (!item.contactId && item.contactName?.toLowerCase() === contact.name.toLowerCase()));
  const activityTransactions = contactTransactions.filter((item) => item.direction === (contact.kind === 'customer' ? 'in' : 'out'));
  const totalPaid = activityTransactions.reduce((sum, item) => sum + item.amount, 0);
  const openObligations = contactObligations.filter((item) => item.status !== 'settled');
  const [ownerCountry, setOwnerCountry] = useState('NG');
  useEffect(() => setOwnerCountry(savedOwnerCountry()), []);
  const normalizedPhone = whatsappNumber(contact.phone, ownerCountry);
  const whatsappHref = normalizedPhone ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(`Hello ${contact.name}, this is regarding our business records.`)}` : '';
  return <div className="fixed inset-0 z-[105] flex justify-end bg-[#0A1125]/60 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="contact-details-title" className="h-full w-full max-w-lg overflow-y-auto border-l border-[#111B33]/15 bg-white shadow-2xl sm:rounded-l-2xl"><header className="flex items-start justify-between border-b border-[#111B33]/10 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{contact.kind === 'customer' ? 'Customer details' : 'Supplier details'}</p><h2 id="contact-details-title" className="mt-2 text-2xl font-black tracking-[-.05em]">{contact.name}</h2><p className="mt-1 text-xs text-[#758096]">{contact.kind === 'customer' ? 'Money customers owe you' : 'Money you owe this supplier'}</p></div><button type="button" onClick={onClose} aria-label="Close contact details" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9]"><X className="h-4 w-4" /></button></header><div className="grid gap-5 p-5"><div className="grid gap-2 rounded-xl border border-[#111B33]/10 bg-[#F8F9FC] p-4 text-xs"><strong className="text-sm">Contact information</strong><span>{contact.email || 'No email saved'}</span><span>{contact.phone || 'No phone saved'}</span></div>{contact.kind === 'customer' && <div className="flex items-center justify-between gap-3 rounded-xl border border-[#25D366]/20 bg-[#F0FFF5] p-4"><div><strong className="block text-xs text-[#176B39]">Message this customer</strong><span className="mt-1 block text-[10px] leading-4 text-[#4F7B60]">Open WhatsApp with a ready-to-send message.</span></div>{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-black text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a> : <span className="text-right text-[10px] font-bold text-[#8E6A2B]">Add a phone number first</span>}</div>}<div className="grid grid-cols-3 gap-2"><div className="rounded-xl border border-[#111B33]/10 bg-white p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#758096]">{contact.kind === 'customer' ? 'Jobs' : 'Bills'}</p><strong className="mt-2 block text-lg font-black">{activityTransactions.length}</strong><p className="mt-1 text-[9px] text-[#758096]">Linked records</p></div><div className="rounded-xl border border-[#111B33]/10 bg-white p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#758096]">{contact.kind === 'customer' ? 'Paid' : 'Paid out'}</p><strong className="mt-2 block text-sm font-black">{formatAmount(totalPaid)}</strong><p className="mt-1 text-[9px] text-[#758096]">Recorded to date</p></div><div className="rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-[#3157F5]">Still owed</p><strong className="mt-2 block text-sm font-black">{formatAmount(Number(contact.outstanding_balance))}</strong><p className="mt-1 text-[9px] text-[#758096]">Open balance</p></div></div><div className="rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Outstanding balance</p><strong className="mt-2 block text-2xl font-black">{formatAmount(Number(contact.outstanding_balance))}</strong></div><section><div className="flex items-center justify-between"><h3 className="text-sm font-black">Open balances</h3><span className="text-[10px] font-bold text-[#758096]">{openObligations.length}</span></div>{openObligations.length ? <div className="mt-3 grid gap-2">{openObligations.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#111B33]/10 p-3"><div className="min-w-0"><strong className="block truncate text-xs">{item.description}</strong><span className="text-[10px] text-[#758096]">{item.due_date ? `Due ${item.due_date}` : 'No due date'} · {item.status}</span></div><strong className="shrink-0 text-xs">{formatAmount(Number(item.balance))}</strong></div>)}</div> : <p className="mt-3 text-xs text-[#758096]">No open balances for this contact.</p>}</section><section><div className="flex items-center justify-between"><h3 className="text-sm font-black">Linked transactions</h3><span className="text-[10px] font-bold text-[#758096]">{contactTransactions.length}</span></div>{contactTransactions.length ? <div className="mt-3 divide-y divide-[#111B33]/10 rounded-lg border border-[#111B33]/10">{contactTransactions.map((item) => <div key={item.transactionId ?? `${item.date}-${item.title}`} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><strong className="block truncate text-xs">{item.title}</strong><span className="text-[10px] text-[#758096]">{item.date}{item.time ? ` · ${item.time}` : ''}</span></div><strong className={`shrink-0 text-xs ${item.direction === 'in' ? 'text-[#557516]' : 'text-[#111B33]'}`}>{item.direction === 'in' ? '+' : '−'}{formatAmount(item.amount)}</strong></div>)}</div> : <p className="mt-3 text-xs text-[#758096]">No linked transactions yet.</p>}</section></div></section></div>;
}

function ObligationDetailsDrawer({ businessId, obligation, formatAmount, onClose, onRefresh }: { businessId: string; obligation: FinanceObligation; formatAmount: (amount: number) => string; onClose: () => void; onRefresh: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage('');
    try {
      await updateFinanceObligation(businessId, obligation.id, { description: String(form.get('description') ?? '').trim(), amount: String(form.get('amount') ?? '').trim().replace(/,/g, ''), due_date: String(form.get('due_date') ?? '') || null, reference: String(form.get('reference') ?? '').trim() });
      await onRefresh(); onClose();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update this balance.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setMessage('');
    try { await deleteFinanceObligation(businessId, obligation.id); await onRefresh(); onClose(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete this balance.'); setBusy(false); }
  }
  return <div className="fixed inset-0 z-[108] flex justify-end bg-[#0A1125]/60 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="obligation-details-title" className="h-full w-full max-w-lg overflow-y-auto border-l border-[#111B33]/15 bg-white shadow-2xl sm:rounded-l-2xl"><header className="flex items-start justify-between border-b border-[#111B33]/10 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{obligation.kind === 'receivable' ? 'Customer balance' : 'Supplier bill'}</p><h2 id="obligation-details-title" className="mt-2 text-2xl font-black tracking-[-.05em]">{formatAmount(Number(obligation.balance))}</h2><p className="mt-1 text-xs text-[#758096]">{obligation.contact_name}</p></div><button type="button" onClick={onClose} aria-label="Close balance details" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9]"><X className="h-4 w-4" /></button></header>{editing ? <form onSubmit={save} className="grid gap-4 p-5"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Description<input name="description" required defaultValue={obligation.description} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Original amount<input name="amount" type="number" min="0.01" step="0.01" required defaultValue={obligation.amount} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /><span className="text-[10px] font-normal text-[#758096]">The amount cannot be lower than payments already recorded.</span></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Due date<input name="due_date" type="date" defaultValue={obligation.due_date ?? ''} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Reference<input name="reference" defaultValue={obligation.reference} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal outline-none focus:border-[#3157F5]" /></label></div>{message && <p role="alert" className="text-xs text-[#A4362B]">{message}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="h-10 rounded-lg border border-[#111B33]/15 px-4 text-xs font-black">Cancel</button><button disabled={busy} className="h-10 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">{busy ? 'Saving…' : 'Save changes'}</button></div></form> : <div className="grid gap-5 p-5"><div className="grid gap-3 rounded-xl border border-[#111B33]/10 bg-[#F8F9FC] p-4 text-sm"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Description</p><p className="mt-1 font-bold">{obligation.description}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Original amount</p><p className="mt-1 font-bold">{formatAmount(Number(obligation.amount))}</p></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Remaining</p><p className="mt-1 font-bold">{formatAmount(Number(obligation.balance))}</p></div></div><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Due date</p><p className="mt-1 font-bold">{obligation.due_date || 'No due date'}</p></div><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#758096]">Status</p><p className="mt-1 font-bold">{obligation.status}</p></div></div></div>{message && <p role="alert" className="text-xs text-[#A4362B]">{message}</p>}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white"><Pencil className="h-3.5 w-3.5" />Edit balance</button>{confirmDelete ? <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E8B4AD] bg-[#FFF4F2] p-2"><span className="text-[10px] font-bold text-[#8E3329]">Delete this balance?</span><button type="button" disabled={busy} onClick={() => void remove()} className="h-8 rounded-md bg-[#A4362B] px-3 text-[10px] font-black text-white">{busy ? 'Deleting…' : 'Confirm'}</button><button type="button" onClick={() => setConfirmDelete(false)} className="h-8 px-2 text-[10px] font-black text-[#64708A]">Cancel</button></div> : <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#A4362B]/25 px-4 text-xs font-black text-[#A4362B]"><Trash2 className="h-3.5 w-3.5" />Delete balance</button>}</div><p className="text-[10px] leading-5 text-[#758096]">Balances with recorded payments cannot be deleted. Void linked payments first if the balance needs to be removed.</p></div>}</section></div>;
}

export default function DashboardSectionContent({ section, findingId, formatAmount, transactions, hasLiveRecords, workspace, summary, businessId, business, currentUser, onUserUpdated, onRefresh, onRecord, financeAction }: {
  section: Section;
  findingId?: string;
  formatAmount: (amount: number) => string;
  transactions: PreviewTransaction[];
  hasLiveRecords: boolean;
  workspace: FinanceWorkspace | null;
  summary?: FinanceOverview['summary'];
  business: FinanceOverview['business'] | null;
  currentUser: CurrentUser | null;
  onUserUpdated: (user: CurrentUser) => void;
  businessId: string;
  onRefresh: () => Promise<void>;
  onRecord: () => void;
  financeAction?: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [performanceInterval, setPerformanceInterval] = useState<PerformanceInterval>('daily');
  const [transactionPreset, setTransactionPreset] = useState<DatePreset>('today');
  const [transactionCustomFrom, setTransactionCustomFrom] = useState('');
  const [transactionCustomTo, setTransactionCustomTo] = useState('');
  const [cashPreset, setCashPreset] = useState<DatePreset>('today');
  const [cashCustomFrom, setCashCustomFrom] = useState('');
  const [cashCustomTo, setCashCustomTo] = useState('');
  const [balancePreset, setBalancePreset] = useState<DatePreset>('all');
  const [transactionPage, setTransactionPage] = useState(1);
  const [balancePage, setBalancePage] = useState(1);
  const [obligationQuery, setObligationQuery] = useState('');
  const [obligationStatus, setObligationStatus] = useState('all');
  const [contactQuery, setContactQuery] = useState('');
  const [contactTab, setContactTab] = useState<'customers' | 'suppliers'>('customers');
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [mutationMessage, setMutationMessage] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<PreviewTransaction | null>(null);
  const [selectedContact, setSelectedContact] = useState<FinanceContact | null>(null);
  const [selectedObligation, setSelectedObligation] = useState<FinanceObligation | null>(null);
  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="number"]'))
      .filter((input) => !input.closest('section[aria-labelledby="record-transaction-title"]'));
    const handlers = inputs.map((input) => {
      // Number inputs do not expose a reliable selection range in all
      // browsers. Convert them before the user types so comma formatting can
      // preserve the actual caret position.
      input.type = 'text';
      input.inputMode = 'decimal';
      const handler = () => {
        const caret = input.selectionStart ?? input.value.length;
        const valueBeforeCaret = input.value.slice(0, caret);
        const formatted = formatMoneyInputValue(input.value);
        const formattedCaret = formatMoneyInputValue(valueBeforeCaret).length;
        input.value = formatted;
        input.setSelectionRange(formattedCaret, formattedCaret);
      };
      input.addEventListener('input', handler);
      return [input, handler] as const;
    });
    return () => handlers.forEach(([input, handler]) => input.removeEventListener('input', handler));
  }, [section, accountFormOpen, selectedTransaction, selectedObligation]);
  const transactionDates = presetDates(transactionPreset, transactionCustomFrom, transactionCustomTo);
  const cashDates = presetDates(cashPreset, cashCustomFrom, cashCustomTo);
  const balanceDates = presetDates(balancePreset);
  const filteredTransactions = useMemo(() => transactions.filter((item) =>
    `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase())
      && (kind === 'all' || item.direction === kind)
      && (!transactionDates.from || (item.dateKey ?? '') >= transactionDates.from)
      && (!transactionDates.to || (item.dateKey ?? '') <= transactionDates.to),
  ), [transactions, query, kind, transactionDates.from, transactionDates.to]);
  const visibleTransactions = filteredTransactions.slice((transactionPage - 1) * 10, transactionPage * 10);
  const receivables = workspace?.obligations.filter((item) => item.kind === 'receivable' && item.status !== 'settled') ?? [];
  const payables = workspace?.obligations.filter((item) => item.kind === 'payable' && item.status !== 'settled') ?? [];
  const filteredReceivables = receivables.filter((item) => `${item.contact_name} ${item.description}`.toLowerCase().includes(obligationQuery.toLowerCase()) && (obligationStatus === 'all' || item.status === obligationStatus) && (!balanceDates.from || (item.due_date ?? '') >= balanceDates.from) && (!balanceDates.to || (item.due_date ?? '') <= balanceDates.to));
  const filteredPayables = payables.filter((item) => `${item.contact_name} ${item.description}`.toLowerCase().includes(obligationQuery.toLowerCase()) && (obligationStatus === 'all' || item.status === obligationStatus) && (!balanceDates.from || (item.due_date ?? '') >= balanceDates.from) && (!balanceDates.to || (item.due_date ?? '') <= balanceDates.to));
  const paginatedReceivables = filteredReceivables.slice((balancePage - 1) * 10, balancePage * 10);
  const filteredAccountTransactions = transactions.filter((item) => (!cashDates.from || (item.dateKey ?? '') >= cashDates.from) && (!cashDates.to || (item.dateKey ?? '') <= cashDates.to));
  const filteredAccountIncome = filteredAccountTransactions.filter((item) => item.direction === 'in').reduce((sum, item) => sum + item.amount, 0);
  const filteredAccountExpenses = filteredAccountTransactions.filter((item) => item.direction === 'out').reduce((sum, item) => sum + item.amount, 0);
  const filteredAccountNet = filteredAccountIncome - filteredAccountExpenses;
  const customers = workspace?.contacts.filter((item) => item.kind === 'customer') ?? [];
  const suppliers = workspace?.contacts.filter((item) => item.kind === 'supplier') ?? [];
  const totalReceivables = Number(summary?.receivables_outstanding ?? receivables.reduce((total, item) => total + Number(item.balance), 0));
  const totalPayables = Number(summary?.payables_outstanding ?? payables.reduce((total, item) => total + Number(item.balance), 0));

  useEffect(() => { setTransactionPage(1); }, [query, kind, transactionPreset, transactionCustomFrom, transactionCustomTo]);
  useEffect(() => { setBalancePage(1); }, [obligationQuery, obligationStatus, balancePreset]);

  async function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;
    const form = new FormData(event.currentTarget);
    setMutationBusy(true); setMutationMessage('');
    try {
      const openingBalance = String(form.get('opening_balance') ?? '').trim().replace(/,/g, '');
      await createFinanceAccount(businessId, { name: String(form.get('name') ?? '').trim(), kind: String(form.get('kind')) as 'cash' | 'bank' | 'other', opening_balance: openingBalance || undefined });
      await onRefresh(); setAccountFormOpen(false); setMutationMessage('Account saved.');
    } catch (error) { setMutationMessage(error instanceof Error ? error.message : 'Could not save the account.'); }
    finally { setMutationBusy(false); }
  }

  if (section === 'transactions') return <div className="grid gap-6"><PageHeading eyebrow="Financial evidence" title="Transactions" description="Search and review the money movements behind your financial picture." sample={!hasLiveRecords} /><PresetDateFilter preset={transactionPreset} setPreset={setTransactionPreset} label="Show" /><div className="grid gap-3 sm:grid-cols-4"><Metric label="Total activity" value={formatAmount(filteredTransactions.reduce((sum, row) => sum + row.amount, 0))} note={hasLiveRecords ? 'In the selected period' : 'Illustrative records'} /><Metric label="Money received" value={formatAmount(filteredTransactions.filter((row) => row.direction === 'in').reduce((sum, row) => sum + row.amount, 0))} note="Selected period" /><Metric label="Money paid" value={formatAmount(filteredTransactions.filter((row) => row.direction === 'out').reduce((sum, row) => sum + row.amount, 0))} note="Selected period" /><Metric label="Records" value={String(filteredTransactions.length)} note={hasLiveRecords ? 'Matching saved records' : 'Preview only'} /></div><section className="overflow-hidden rounded-xl border border-[#111B33]/10 bg-white"><div className="grid gap-3 border-b border-[#111B33]/10 p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#111B33]/10 px-3"><Search className="h-4 w-4 text-[#758096]" /><input aria-label="Search transactions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search description or category" className="h-10 w-full bg-transparent text-xs outline-none" /></div><select aria-label="Filter by transaction type" value={kind} onChange={(event) => setKind(event.target.value)} className="h-10 rounded-lg border border-[#111B33]/10 bg-white px-3 text-xs font-bold"><option value="all">All activity</option><option value="in">Money received</option><option value="out">Money paid</option><option value="transfer">Account transfers</option></select><button type="button" onClick={onRecord} className="h-10 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">Record transaction</button></div></div>{visibleTransactions.length ? <DataTable headers={['Date', 'Time', 'Description', 'Type', 'Category / contact', 'Amount']} onRowClick={(index) => { const transaction = visibleTransactions[index]; if (transaction.transactionId) setSelectedTransaction(transaction); }} rows={visibleTransactions.map((item) => [item.date, item.time ?? '—', item.title, item.direction === 'transfer' ? 'Account transfer' : item.direction === 'in' ? 'Money received' : 'Money paid', item.detail, `${item.direction === 'transfer' ? '↔ ' : item.direction === 'in' ? '+' : '−'}${formatAmount(item.amount)}`])} /> : <p className="p-10 text-center text-xs text-[#758096]">No transactions match your filters.</p>}<Pagination page={transactionPage} setPage={setTransactionPage} total={filteredTransactions.length} /></section><p className="text-[10px] leading-5 text-[#758096]">{hasLiveRecords ? 'Linked payments reduce the related outstanding balance. Account transfers change where cash sits without being counted as income or expense.' : 'Sample records are for preview only. Save your business setup to record real transactions.'}</p>{selectedTransaction && <TransactionDetailsModal businessId={businessId} transaction={selectedTransaction} accounts={workspace?.accounts ?? []} formatAmount={formatAmount} onClose={() => setSelectedTransaction(null)} onRefresh={onRefresh} />}</div>;

  if (section === 'intelligence') return findingId ? <IntelligenceFindingDetail findingId={findingId} findings={workspace?.insights ?? []} hasLiveRecords={hasLiveRecords} formatAmount={formatAmount} /> : <IntelligenceSection findings={workspace?.insights ?? []} openFindings={workspace?.intelligenceSummary.open_findings ?? 0} potentialImpact={workspace?.intelligenceSummary.potential_impact ?? '0.00'} health={workspace?.financialHealth} hasLiveRecords={hasLiveRecords} businessId={businessId} formatAmount={formatAmount} />;

  if (section === 'cash-accounts') {
    const isCashPeriod = cashPreset !== 'all';
    const accountPeriodRows = hasLiveRecords ? Array.from(filteredAccountTransactions.reduce((rows, item) => {
      const key = item.accountId ?? 'unassigned';
      const row = rows.get(key) ?? { name: item.accountName ?? 'Unassigned activity', received: 0, paid: 0 };
      if (item.direction === 'in') row.received += item.amount;
      if (item.direction === 'out') row.paid += item.amount;
      rows.set(key, row);
      return rows;
    }, new Map<string, { name: string; received: number; paid: number }>()).values()) : [];
    return <div className="grid gap-6"><PageHeading eyebrow="Cash position" title="Where your money sits" description="See how much came in or went out during a period, or your current recorded cash position." sample={!hasLiveRecords} /><PresetDateFilter preset={cashPreset} setPreset={setCashPreset} label="Review account activity" customFrom={cashCustomFrom} customTo={cashCustomTo} setCustomFrom={setCashCustomFrom} setCustomTo={setCashCustomTo} /><div className="grid gap-3 sm:grid-cols-3"><Metric label={isCashPeriod ? 'Net cash activity' : 'Current cash position'} value={formatAmount(isCashPeriod ? filteredAccountNet : Number(summary?.cash_position ?? (hasLiveRecords ? 0 : 2_480_000)))} note={isCashPeriod ? 'Money received less money paid in the selected period' : 'Current recorded balance across accounts'} prominent /><Metric label="Bills due in 7 days" value={formatAmount(hasLiveRecords ? payables.filter((item) => item.due_date && new Date(`${item.due_date}T00:00:00`) <= new Date(Date.now() + 7 * 86400000)).reduce((sum, item) => sum + Number(item.balance), 0) : 620_000)} note={hasLiveRecords ? 'From saved supplier obligations' : 'Illustrative obligations'} /><Metric label="Expected collections" value={formatAmount(hasLiveRecords ? receivables.reduce((sum, item) => sum + Number(item.balance), 0) : 300_000)} note={hasLiveRecords ? 'From saved customer obligations' : 'Illustrative receivables'} /></div>{isCashPeriod && <div className="grid gap-3 rounded-xl border border-[#3157F5]/15 bg-[#EEF1FF] p-4 text-xs text-[#52628F]"><div className="flex items-center justify-between gap-3"><strong className="text-[#111B33]">Selected period</strong><span className="text-[10px]">Money received {formatAmount(filteredAccountIncome)} · Money paid {formatAmount(filteredAccountExpenses)}</span></div>{accountPeriodRows.length ? <div className="grid gap-2">{accountPeriodRows.map((row) => <div key={row.name} className="grid gap-1 rounded-lg border border-[#3157F5]/10 bg-white/70 p-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr] sm:items-center"><strong className="text-[#111B33]">{row.name}</strong><span>Received: {formatAmount(row.received)}</span><span>Paid: {formatAmount(row.paid)}</span><span>Net: {formatAmount(row.received - row.paid)}</span></div>)}</div> : <p className="text-[10px]">No account activity in this period.</p>}</div>}{accountFormOpen && <form onSubmit={addAccount} className="grid gap-3 rounded-xl border border-[#111B33]/10 bg-white p-4 sm:grid-cols-4"><input name="name" required maxLength={100} placeholder="Account name" className="h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><select name="kind" className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs"><option value="cash">Cash</option><option value="bank">Bank account</option><option value="other">Other account</option></select><input name="opening_balance" type="number" step="0.01" defaultValue="0" placeholder="Opening balance" className="h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><button disabled={mutationBusy} className="h-10 rounded-lg bg-[#111B33] px-4 text-xs font-black text-white">{mutationBusy ? 'Saving…' : 'Save account'}</button></form>}{mutationMessage && <p role="status" className="text-xs text-[#64708A]">{mutationMessage}</p>}<section className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Accounts</h2><p className="mt-1 text-xs text-[#758096]">Account cards always show the current recorded balance. Use the period filter above to review activity during a date range.</p></div><div className="flex items-center gap-3">{!hasLiveRecords && <SampleTag />}{hasLiveRecords && <button type="button" onClick={() => { setMutationMessage(''); setAccountFormOpen((open) => !open); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#3157F5] px-3 text-xs font-black text-white"><Plus className="h-4 w-4" />Add account</button>}</div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{hasLiveRecords ? workspace?.accounts.length ? workspace.accounts.map((account) => <article key={account.id} className="flex items-center justify-between border border-[#111B33]/10 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><WalletCards className="h-4 w-4" /></span><div><strong className="text-xs">{account.name}</strong><p className="mt-1 text-[10px] text-[#758096]">{account.kind} · {account.currency}</p></div></div><strong className="text-sm">{formatAmount(Number(account.balance))}</strong></article>) : <p className="py-8 text-center text-xs text-[#758096]">No accounts yet. Add an account to track a separate cash or bank balance.</p> : <><article className="flex items-center justify-between border border-[#111B33]/10 p-4"><div><strong className="text-xs">Cash on hand</strong><p className="mt-1 text-[10px] text-[#758096]">Preview balance</p></div><strong className="text-sm">{formatAmount(650_000)}</strong></article><article className="flex items-center justify-between border border-[#111B33]/10 p-4"><div><strong className="text-xs">Business bank account</strong><p className="mt-1 text-[10px] text-[#758096]">Preview balance</p></div><strong className="text-sm">{formatAmount(1_830_000)}</strong></article></>}</div></section>{!hasLiveRecords && <article className="flex gap-3 rounded-xl border border-[#E8D89F] bg-[#FFF9E8] p-4"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7311]" /><div><strong className="text-xs">Preview scenario</strong><p className="mt-1 text-xs leading-5 text-[#786B4C]">Sample bills exceed sample cash. Confirm actual balances before making payment decisions.</p></div></article>}</div>;
  }

  if (section === 'receivables') {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdueRows = filteredReceivables.filter((item) => item.due_date && new Date(`${item.due_date}T00:00:00`) < today);
    const soonRows = filteredReceivables.filter((item) => item.due_date && new Date(`${item.due_date}T00:00:00`) >= today && new Date(`${item.due_date}T00:00:00`) <= new Date(today.getTime() + 7 * 86400000));
    return <div className="grid gap-6"><PageHeading eyebrow="Customer balances" title="Customer balances" description="Track what customers owe, what is overdue, and which balances may need follow-up." sample={!hasLiveRecords} /><div className="flex flex-wrap gap-2"><input aria-label="Search balances" value={obligationQuery} onChange={(event) => setObligationQuery(event.target.value)} placeholder="Search customer or bill" className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#111B33]/10 bg-white px-3 text-xs outline-none" /><select aria-label="Filter balance status" value={obligationStatus} onChange={(event) => setObligationStatus(event.target.value)} className="h-10 rounded-lg border border-[#111B33]/10 bg-white px-3 text-xs font-bold"><option value="all">All statuses</option><option value="open">Open</option><option value="partial">Partially paid</option><option value="disputed">Disputed</option></select></div><PresetDateFilter preset={balancePreset} setPreset={setBalancePreset} label="Due dates" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Outstanding" value={formatAmount(hasLiveRecords ? totalReceivables : 1_250_000)} note={hasLiveRecords ? 'Saved open obligations' : 'Sample open balances'} /><Metric label="Overdue" value={formatAmount(hasLiveRecords ? overdueRows.reduce((sum, item) => sum + Number(item.balance), 0) : 380_000)} note={hasLiveRecords ? 'Past due date' : 'Sample past-due amount'} /><Metric label="Due in 7 days" value={formatAmount(hasLiveRecords ? soonRows.reduce((sum, item) => sum + Number(item.balance), 0) : 510_000)} note={hasLiveRecords ? 'Saved due dates' : 'Sample schedule'} /><Metric label="Money received this month" value={formatAmount(Number(summary?.income_this_month ?? (hasLiveRecords ? 0 : 940_000)))} note={hasLiveRecords ? 'All recorded income' : 'Sample receipts'} /></div><section className="overflow-visible rounded-xl border border-[#111B33]/10 bg-white"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#111B33]/10 p-5"><div><h2 className="text-lg font-black">Customer balances</h2><p className="mt-1 text-xs text-[#758096]">{hasLiveRecords ? 'Loaded from your saved customer obligations.' : 'Sample balances are shown for layout preview only.'}</p></div>{financeAction}</div>{hasLiveRecords ? filteredReceivables.length ? <><DataTable headers={['Customer', 'Description', 'Outstanding', 'Due date', 'Status']} onRowClick={(index) => setSelectedObligation(paginatedReceivables[index])} rows={paginatedReceivables.map((item) => [item.contact_name, item.description, formatAmount(Number(item.balance)), item.due_date ?? 'No due date', item.status])} /><Pagination page={balancePage} setPage={setBalancePage} total={filteredReceivables.length} /></> : <p className="p-10 text-center text-xs text-[#758096]">No customer balances recorded yet.</p> : <DataTable headers={['Customer', 'Description', 'Outstanding', 'Due date', 'Status']} rows={[["Amina Bello", 'Wholesale sale', formatAmount(180_000), 'Oct 29, 2026', 'Due soon'], ['Dayo Stores', 'Stock order', formatAmount(125_000), 'Oct 21, 2026', 'Overdue'], ['Kemi Foods', 'Produce delivery', formatAmount(90_000), 'Oct 25, 2026', 'Overdue']]} />}</section><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><h2 className="text-sm font-black">A useful next step</h2><p className="mt-2 text-xs leading-5 text-[#64708A]">Review the oldest overdue balances first. Confirm that each sale and any partial payments are recorded before following up.</p><Link href="/dashboard/customers-suppliers" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">View customer history <ArrowRight className="h-4 w-4" /></Link></article>{selectedObligation && <ObligationDetailsDrawer businessId={businessId} obligation={selectedObligation} formatAmount={formatAmount} onClose={() => setSelectedObligation(null)} onRefresh={onRefresh} />}</div>;
  }

  if (section === 'payables') {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdueRows = filteredPayables.filter((item) => item.due_date && new Date(`${item.due_date}T00:00:00`) < today);
    const dueToday = filteredPayables.filter((item) => item.due_date === today.toISOString().slice(0, 10));
    const soonRows = filteredPayables.filter((item) => item.due_date && new Date(`${item.due_date}T00:00:00`) >= today && new Date(`${item.due_date}T00:00:00`) <= new Date(today.getTime() + 7 * 86400000));
    return <div className="grid gap-6"><PageHeading eyebrow="Supplier obligations" title="Payables" description="Know what is due, when it is due, and how those commitments compare with recorded cash." sample={!hasLiveRecords} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Outstanding bills" value={formatAmount(hasLiveRecords ? totalPayables : 840_000)} note={hasLiveRecords ? 'Saved supplier obligations' : 'Sample supplier obligations'} /><Metric label="Due today" value={formatAmount(hasLiveRecords ? dueToday.reduce((sum, item) => sum + Number(item.balance), 0) : 215_000)} note={hasLiveRecords ? 'Saved due dates' : 'Sample schedule'} /><Metric label="Due in 7 days" value={formatAmount(hasLiveRecords ? soonRows.reduce((sum, item) => sum + Number(item.balance), 0) : 620_000)} note={hasLiveRecords ? `${overdueRows.length} overdue` : 'Sample schedule'} /><Metric label="Money paid this month" value={formatAmount(Number(summary?.expenses_this_month ?? (hasLiveRecords ? 0 : 1_140_000)))} note={hasLiveRecords ? 'All recorded expenses' : 'Illustrative payments'} /></div><section className="overflow-visible rounded-xl border border-[#111B33]/10 bg-white"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#111B33]/10 p-5"><div><h2 className="text-lg font-black">Upcoming bills</h2><p className="mt-1 text-xs text-[#758096]">{hasLiveRecords ? 'Loaded from saved supplier obligations.' : 'Sample obligations are not saved bills.'}</p></div>{financeAction}</div>{hasLiveRecords ? filteredPayables.length ? <DataTable headers={['Supplier', 'Bill', 'Outstanding', 'Due date', 'Status']} onRowClick={(index) => setSelectedObligation(filteredPayables[index])} rows={filteredPayables.map((item) => [item.contact_name, item.description, formatAmount(Number(item.balance)), item.due_date ?? 'No due date', item.status])} /> : <p className="p-10 text-center text-xs text-[#758096]">No supplier bills recorded yet.</p> : <DataTable headers={['Supplier', 'Bill', 'Outstanding', 'Due date', 'Status']} rows={[["Brightline Packaging", 'Supplier invoice', formatAmount(215_000), 'Oct 29, 2026', 'Due soon'], ['Property manager', 'Shop rent', formatAmount(350_000), 'Oct 31, 2026', 'Upcoming'], ['Lagos Power', 'Power and internet', formatAmount(42_500), 'Nov 03, 2026', 'Upcoming']]} />}</section><article className="rounded-xl border border-[#111B33] bg-[#111B33] p-5 text-white"><div className="flex items-center gap-2 text-[#C9F45D]"><ShieldCheck className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.12em]">Payment planning</p></div><p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">Compare recorded obligations with confirmed cash and collections before committing to additional spending.</p></article>{selectedObligation && <ObligationDetailsDrawer businessId={businessId} obligation={selectedObligation} formatAmount={formatAmount} onClose={() => setSelectedObligation(null)} onRefresh={onRefresh} />}</div>;
  }

  if (section === 'performance') {
    const performanceDays = workspace?.performanceDaily ?? [];
    const selectedDailyRows = performanceDays.filter((item) => (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate));
    const performanceMonths = fromDate || toDate
      ? [{ month: (fromDate || toDate).slice(0, 7), income: selectedDailyRows.reduce((sum, item) => sum + Number(item.income), 0), expenses: selectedDailyRows.reduce((sum, item) => sum + Number(item.expenses), 0), net: selectedDailyRows.reduce((sum, item) => sum + Number(item.net), 0) }]
      : (workspace?.performance ?? []);
    const latest = performanceMonths[performanceMonths.length - 1];
    const latestIndex = latest ? (workspace?.performance.findIndex((item) => item.month === latest.month) ?? -1) : -1;
    const previous = latestIndex > 0 ? workspace?.performance[latestIndex - 1] : undefined;
    const selectedIncome = fromDate || toDate ? selectedDailyRows.reduce((sum, item) => sum + Number(item.income), 0) : Number(latest?.income ?? (hasLiveRecords ? 0 : summary?.income_this_month ?? 940_000));
    const selectedExpenses = fromDate || toDate ? selectedDailyRows.reduce((sum, item) => sum + Number(item.expenses), 0) : Number(latest?.expenses ?? (hasLiveRecords ? 0 : summary?.expenses_this_month ?? 1_140_000));
    const selectedNet = selectedIncome - selectedExpenses;
    const percentageChange = (value: number, prior?: string) => {
      const previousValue = Number(prior ?? 0);
      return previousValue > 0 ? Math.round(((value - previousValue) / previousValue) * 100) : null;
    };
    const incomeChange = percentageChange(selectedIncome, previous?.income) ?? 0;
    const expenseChange = percentageChange(selectedExpenses, previous?.expenses) ?? 0;
    const chartMax = Math.max(1, ...performanceMonths.flatMap((item) => [Number(item.income), Number(item.expenses)]));
    const reportingLabel = fromDate || toDate ? (fromDate && toDate ? fromDate + ' to ' + toDate : fromDate ? 'From ' + fromDate : 'Through ' + toDate) : (latest ? new Date(latest.month + '-01T00:00:00').toLocaleDateString('en', { month: 'long', year: 'numeric' }) : 'Current period');
    return <PerformanceSection fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} interval={performanceInterval} setInterval={setPerformanceInterval} workspace={workspace} hasLiveRecords={hasLiveRecords} summary={summary} formatAmount={formatAmount} transactions={transactions} />;
    return <div className="grid gap-6"><PageHeading eyebrow="Recorded results" title="Performance" description="Understand how your business is performing over time." sample={!hasLiveRecords} /><DateFilterBar fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} label="Reporting period" /><div className="grid gap-3 sm:grid-cols-2"><Metric label="Recorded sales" value={formatAmount(selectedIncome)} note={incomeChange === null ? reportingLabel : (incomeChange >= 0 ? '↑ ' : '↓ ') + Math.abs(incomeChange) + '% vs previous period'} /><Metric label="Recorded expenses" value={formatAmount(selectedExpenses)} note={expenseChange === null ? reportingLabel : (expenseChange >= 0 ? '↑ ' : '↓ ') + Math.abs(expenseChange) + '% vs previous period'} /></div><section className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Sales vs expenses</h2><p className="mt-1 text-xs text-[#758096]">{hasLiveRecords ? 'Monthly recorded figures · ' + reportingLabel : 'Illustrative monthly figures'}</p></div>{!hasLiveRecords && <SampleTag />}</div>{hasLiveRecords && performanceMonths.length ? <div className="mt-7 grid h-56 grid-cols-3 items-end gap-3 border-b border-l border-[#111B33]/10 px-3 pb-2 sm:grid-cols-6">{performanceMonths.slice(-6).map((item) => <div key={item.month} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><span className="w-3 rounded-t-sm bg-[#3157F5] sm:w-5" style={{ height: (Number(item.income) / chartMax * 100) + '%' }} /><span className="w-3 rounded-t-sm bg-[#C9F45D] sm:w-5" style={{ height: (Number(item.expenses) / chartMax * 100) + '%' }} /></div><span className="text-[9px] font-bold text-[#758096]">{new Date(item.month + '-01T00:00:00').toLocaleDateString('en', { month: 'short' })}</span></div>)}</div> : <div className="mt-7 grid h-56 grid-cols-3 items-end gap-3 border-b border-l border-[#111B33]/10 px-3 pb-2 sm:grid-cols-6">{[['May','53%','30%'],['Jun','65%','42%'],['Jul','48%','35%'],['Aug','78%','46%'],['Sep','60%','39%'],['Oct','88%','52%']].map(([month, sales, expenses]) => <div key={month} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><span className="w-3 rounded-t-sm bg-[#3157F5] sm:w-5" style={{ height: sales }} /><span className="w-3 rounded-t-sm bg-[#C9F45D] sm:w-5" style={{ height: expenses }} /></div><span className="text-[9px] font-bold text-[#758096]">{month}</span></div>)}</div>}<div className="mt-4 flex gap-4 text-[10px] font-bold text-[#64708A]"><span><b className="text-[#3157F5]">■</b> Sales</span><span><b className="text-[#557516]">■</b> Expenses</span></div></section><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Profitability</p><strong className="mt-3 block text-2xl font-black">{formatAmount(selectedNet)}</strong><p className="mt-1 text-xs text-[#758096]">Recorded sales less recorded expenses</p></article><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">Cash flow</p><strong className="mt-3 block text-2xl font-black">{formatAmount(selectedNet)}</strong><p className="mt-1 text-xs text-[#758096]">Money received less money paid in the selected period</p></article></div></div>;
  }


  if (section === 'customers-suppliers') {
  const selectedContacts = (contactTab === 'customers' ? customers : suppliers).filter((item) => item.name.toLowerCase().includes(contactQuery.toLowerCase()));
    const obligationsForContactType = contactTab === 'customers' ? receivables : payables;
    const openTotal = contactTab === 'customers' ? totalReceivables : totalPayables;
    const overdueTotal = obligationsForContactType.filter((item) => item.due_date && isOverdue(item.due_date)).reduce((sum, item) => sum + Number(item.balance), 0);
    return <div className="grid gap-6"><PageHeading eyebrow="Financial relationships" title="Customers & suppliers" description="See who owes the business, who the business owes, and the activity behind each relationship." sample={!hasLiveRecords} /><div className="flex flex-wrap gap-2"><input aria-label="Search contacts" value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search customers or suppliers" className="h-10 w-full rounded-lg border border-[#111B33]/10 bg-white px-3 text-xs outline-none sm:max-w-sm" /></div><div className="flex gap-2 border-b border-[#111B33]/10"><button type="button" onClick={() => setContactTab('customers')} className={`border-b-2 px-4 py-3 text-xs font-black ${contactTab === 'customers' ? 'border-[#3157F5] text-[#3157F5]' : 'border-transparent text-[#758096]'}`}>Customers</button><button type="button" onClick={() => setContactTab('suppliers')} className={`border-b-2 px-4 py-3 text-xs font-black ${contactTab === 'suppliers' ? 'border-[#3157F5] text-[#3157F5]' : 'border-transparent text-[#758096]'}`}>Suppliers</button></div><div className="grid gap-3 sm:grid-cols-3"><Metric label={contactTab === 'customers' ? 'Outstanding customer debt' : 'Outstanding supplier bills'} value={formatAmount(hasLiveRecords ? openTotal : (contactTab === 'customers' ? 1_250_000 : 840_000))} note={hasLiveRecords ? 'From saved obligations' : 'Sample contact balances'} /><Metric label="Overdue amount" value={formatAmount(hasLiveRecords ? overdueTotal : (contactTab === 'customers' ? 380_000 : 215_000))} note={hasLiveRecords ? 'Past due date' : 'Illustrative amount'} /><Metric label="Contact records" value={String(hasLiveRecords ? selectedContacts.length : 3)} note={hasLiveRecords ? `Saved ${contactTab}` : 'Sample contacts'} /></div><section className="overflow-visible rounded-xl border border-[#111B33]/10 bg-white"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#111B33]/10 p-5"><div><h2 className="text-lg font-black">{contactTab === 'customers' ? 'Customer overview' : 'Supplier overview'}</h2><p className="mt-1 text-xs text-[#758096]">{hasLiveRecords ? 'Loaded from your saved business contacts.' : 'Sample profiles · layout preview only.'}</p></div>{financeAction}</div>{hasLiveRecords ? selectedContacts.length ? <DataTable headers={['Name', 'Outstanding', 'Last transaction', 'Email', 'Phone']} onRowClick={(index) => setSelectedContact(selectedContacts[index])} rows={selectedContacts.map((contact) => [contact.name, formatAmount(Number(contact.outstanding_balance)), contact.last_transaction_on ?? 'No transactions', contact.email || '—', contact.phone || '—'])} /> : <p className="p-10 text-center text-xs text-[#758096]">No {contactTab} saved yet.</p> : <DataTable headers={['Name', 'Outstanding', 'Last activity', 'Contact', 'Notes']} rows={contactTab === 'customers' ? [['Dayo Stores', formatAmount(125_000), 'Oct 21, 2026', 'Sample', 'Overdue balance'], ['Amina Bello', formatAmount(180_000), 'Oct 26, 2026', 'Sample', 'Payment recorded'], ['Northstar Foods', formatAmount(215_000), 'Oct 18, 2026', 'Sample', 'Open balance']] : [['Brightline Packaging', formatAmount(215_000), 'Oct 20, 2026', 'Sample', 'Bill due soon'], ['Property manager', formatAmount(350_000), 'Sep 30, 2026', 'Sample', 'Monthly obligation'], ['Lagos Power', formatAmount(42_500), 'Oct 03, 2026', 'Sample', 'Upcoming bill']]} />}</section><div className="flex flex-wrap gap-3"><Link href="/dashboard/receivables" className="inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">Open customer balances <ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/payables" className="inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">Open supplier bills <ArrowRight className="h-4 w-4" /></Link></div>{selectedContact && <ContactDetailsDrawer contact={selectedContact} obligations={workspace?.obligations ?? []} transactions={transactions} formatAmount={formatAmount} onClose={() => setSelectedContact(null)} />}</div>;
  }

  if (section === 'profile') return <DashboardProfileSection user={currentUser} onUpdated={onUserUpdated} />;

  const currencyLocked = Boolean(workspace?.accounts.length || workspace?.obligations.length || hasLiveRecords);
  return <BusinessSettingsSection business={business} currencyLocked={currencyLocked} onSaved={onRefresh} />;
}

export type { Section as DashboardSection };
