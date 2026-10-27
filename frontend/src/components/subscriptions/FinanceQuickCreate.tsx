'use client';

import { type FormEvent, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, FileText, LoaderCircle, Plus, UserRoundPlus, X } from 'lucide-react';
import { createFinanceContact, createFinanceObligation, type FinanceContact } from '@/lib/finance-api';

export default function FinanceQuickCreate({ businessId, contacts, onSaved, mode }: {
  businessId: string;
  contacts: FinanceContact[];
  onSaved: () => Promise<void>;
  mode: 'contact' | 'receivable' | 'payable';
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<'contact' | 'balance' | null>(mode === 'contact' ? 'contact' : 'balance');
  const [balanceKind, setBalanceKind] = useState<'receivable' | 'payable'>(mode === 'payable' ? 'payable' : 'receivable');
  const balanceContacts = contacts.filter((contact) => contact.kind === (balanceKind === 'receivable' ? 'customer' : 'supplier'));

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true); setNotice('');
    try {
      await createFinanceContact(businessId, {
        kind: String(form.get('kind')) as 'customer' | 'supplier',
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
      });
      await onSaved(); formElement.reset(); if (!mode) setActiveForm('balance'); setNotice(mode === 'contact' ? 'Contact saved.' : 'Contact saved. You can now record an amount due.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save the contact.'); }
    finally { setBusy(false); }
  }

  async function saveObligation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true); setNotice('');
    try {
      await createFinanceObligation(businessId, {
        contact: String(form.get('contact') ?? ''),
        kind: mode === 'receivable' ? 'receivable' : mode === 'payable' ? 'payable' : String(form.get('kind')) as 'receivable' | 'payable',
        description: String(form.get('description') ?? '').trim(),
        amount: String(form.get('amount') ?? ''),
        due_date: String(form.get('due_date') ?? '') || null,
        affects_performance: form.get('opening_balance') !== 'on',
      });
      await onSaved(); formElement.reset(); setNotice('Obligation saved.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save the obligation.'); }
    finally { setBusy(false); }
  }

  const fieldClass = 'h-11 min-w-0 w-full rounded-lg border border-[#111B33]/12 bg-white px-3 text-xs text-[#111B33] outline-none transition placeholder:text-[#9AA3B5] focus:border-[#3157F5] focus:ring-2 focus:ring-[#3157F5]/10';
  const selectClass = `${fieldClass} appearance-none pr-9`;

  return <>
    <button type="button" onClick={() => { setNotice(''); setOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#111B33] bg-[#111B33] px-3.5 py-2 text-left text-xs font-black text-white shadow-[0_6px_16px_rgba(17,27,51,.16)] transition hover:-translate-y-0.5 hover:bg-[#1E2B4A] focus:outline-none focus:ring-4 focus:ring-[#C9F45D]/40">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#C9F45D] text-[#111B33]"><Plus className="h-3.5 w-3.5" /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-black">{mode === 'contact' ? 'Add a customer or supplier' : mode === 'receivable' ? 'Add a customer balance' : 'Add a supplier bill'}</span><span className="mt-1 block text-[11px] leading-4 text-white/70">{mode === 'contact' ? 'Save a contact to connect their activity.' : mode === 'receivable' ? 'Record money a customer owes your business.' : 'Record money your business owes a supplier.'}</span></span>
    </button>

    {open && <div className="fixed inset-0 z-[115] flex justify-end bg-[#0A1125]/60 backdrop-blur-sm">
      <button type="button" aria-label="Close form" onClick={() => { if (!busy) { setOpen(false); setNotice(''); } }} className="absolute inset-0 cursor-default" />
      <section role="dialog" aria-modal="true" aria-labelledby="finance-quick-create-title" className="relative z-10 min-h-full w-full max-w-lg overflow-y-auto border-l border-[#111B33]/15 bg-[#F8F9FC] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#111B33]/10 bg-white p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Business records</p><h2 id="finance-quick-create-title" className="mt-2 text-xl font-black tracking-[-.04em]">{mode === 'contact' ? 'Add a customer or supplier' : mode === 'receivable' ? 'Add a customer balance' : 'Add a supplier bill'}</h2></div><button type="button" disabled={busy} onClick={() => { setOpen(false); setNotice(''); }} aria-label="Close form" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9] text-[#64708A] transition hover:bg-[#E8EBF2] disabled:opacity-50"><X className="h-4 w-4" /></button></header>
    <div className="p-3 sm:p-5">
      {activeForm === null ? <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => { setNotice(''); setActiveForm('contact'); }} className="group rounded-xl border border-[#111B33]/[.08] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#3157F5]/35 hover:shadow-[0_10px_26px_rgba(17,27,51,.06)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF1FF] text-[#3157F5]"><UserRoundPlus className="h-4 w-4" /></span><h2 className="mt-4 text-sm font-black">New contact</h2><p className="mt-1 text-[11px] leading-5 text-[#758096]">Save a customer or supplier to connect their activity.</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-[#3157F5]">Continue <ArrowRight className="h-3.5 w-3.5" /></span>
        </button>
        <button type="button" onClick={() => { setNotice(''); setActiveForm('balance'); }} className="group rounded-xl border border-[#111B33]/[.08] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#557516]/35 hover:shadow-[0_10px_26px_rgba(17,27,51,.06)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF6E4] text-[#557516]"><FileText className="h-4 w-4" /></span><h2 className="mt-4 text-sm font-black">Record an amount due</h2><p className="mt-1 text-[11px] leading-5 text-[#758096]">Track an unpaid customer invoice or supplier bill.</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-[#557516]">Continue <ArrowRight className="h-3.5 w-3.5" /></span>
        </button>
      </div> : <>
        {!mode && <button type="button" onClick={() => { setNotice(''); setActiveForm(null); }} className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-black text-[#64708A] transition hover:text-[#3157F5]"><ArrowLeft className="h-3.5 w-3.5" />Choose another action</button>}
        {activeForm === 'contact' ? <form onSubmit={saveContact} className="mx-auto grid max-w-2xl content-start gap-4 rounded-xl border border-[#111B33]/[.08] bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><UserRoundPlus className="h-4 w-4" /></span><div><h2 className="text-sm font-black">New contact</h2><p className="mt-1 text-[11px] leading-4 text-[#758096]">Save a customer or supplier to connect their activity.</p></div></div>
          <label className="grid gap-1.5 text-[10px] font-bold text-[#64708A]">Contact type<span className="relative"><select name="kind" className={selectClass}><option value="customer">Customer</option><option value="supplier">Supplier</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#758096]" /></span></label>
          <label className="grid gap-1.5 text-[10px] font-bold text-[#64708A]">Name<input name="name" required maxLength={120} placeholder="e.g. Amina Bello or Northside Supplies" className={fieldClass} /></label>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1.5 text-[10px] font-bold text-[#64708A]">Email <span className="font-normal text-[#9AA3B5]">Optional</span><input name="email" type="email" placeholder="name@business.com" className={fieldClass} /></label><label className="grid min-w-0 gap-1.5 text-[10px] font-bold text-[#64708A]">Phone <span className="font-normal text-[#9AA3B5]">Optional</span><input name="phone" placeholder="Phone number" className={fieldClass} /></label></div>
          <button disabled={busy || !businessId} aria-busy={busy} className="button-loading inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#111B33] px-4 text-xs font-black text-white transition hover:bg-[#1E2B4A] disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{busy ? 'Saving…' : 'Save contact'}</button>
        </form> : <form onSubmit={saveObligation} className="mx-auto grid max-w-2xl content-start gap-4 rounded-xl border border-[#111B33]/[.08] bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF6E4] text-[#557516]"><FileText className="h-4 w-4" /></span><div><h2 className="text-sm font-black">Record an amount due</h2><p className="mt-1 text-[11px] leading-4 text-[#758096]">Track an unpaid customer invoice or supplier bill.</p></div></div>
          {mode ? <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[#3157F5]/15 bg-[#EEF1FF] px-3 text-[10px] font-black text-[#3157F5]">{balanceKind === 'receivable' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}{balanceKind === 'receivable' ? 'Customer owes you' : 'You owe supplier'}</div> : <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#F2F4F9] p-1"><label className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 text-center text-[10px] font-bold text-[#64708A] has-[:checked]:bg-white has-[:checked]:text-[#3157F5] has-[:checked]:shadow-sm"><input type="radio" name="kind" value="receivable" checked={balanceKind === 'receivable'} onChange={() => setBalanceKind('receivable')} className="sr-only" /><ArrowDownLeft className="h-3.5 w-3.5" />Customer owes you</label><label className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 text-center text-[10px] font-bold text-[#64708A] has-[:checked]:bg-white has-[:checked]:text-[#3157F5] has-[:checked]:shadow-sm"><input type="radio" name="kind" value="payable" checked={balanceKind === 'payable'} onChange={() => setBalanceKind('payable')} className="sr-only" /><ArrowUpRight className="h-3.5 w-3.5" />You owe supplier</label></div>}
          <label className="grid gap-1.5 text-[10px] font-bold text-[#64708A]">{balanceKind === 'receivable' ? 'Customer' : 'Supplier'}<span className="relative"><select name="contact" required disabled={!balanceContacts.length} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-[#F8F9FC] disabled:text-[#9AA3B5]`}><option value="">{balanceContacts.length ? 'Choose a contact' : `Add a ${balanceKind === 'receivable' ? 'customer' : 'supplier'} first`}</option>{balanceContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#758096]" /></span></label>
          <label className="grid gap-1.5 text-[10px] font-bold text-[#64708A]">Invoice or bill details<input name="description" required maxLength={160} placeholder="e.g. March stock order" className={fieldClass} /></label>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1.5 text-[10px] font-bold text-[#64708A]">Original amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" className={fieldClass} /></label><label className="grid min-w-0 gap-1.5 text-[10px] font-bold text-[#64708A]">Due date <span className="font-normal text-[#9AA3B5]">Optional</span><input name="due_date" type="date" className={fieldClass} /></label></div>
          <label className="flex items-start gap-2 rounded-lg bg-[#F8F9FC] p-3 text-[10px] leading-4 text-[#64708A]"><input name="opening_balance" type="checkbox" className="mt-0.5 shrink-0 accent-[#3157F5]" /><span><strong className="text-[#111B33]">This balance predates my records.</strong> Exclude it from this period’s recorded performance.</span></label>
          <button disabled={busy || !businessId || !balanceContacts.length} aria-busy={busy} className="button-loading inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white transition hover:bg-[#2748D8] disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? 'Saving…' : 'Save balance'}</button>
        </form>}
      </>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-[#3157F5]/10 bg-white px-4 py-3 text-xs text-[#64708A]">{notice}</p>}
    </div>
      </section>
    </div>}
  </>;
}
