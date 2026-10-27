'use client';

import { type FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { createFinanceContact, createFinanceObligation, type FinanceContact } from '@/lib/finance-api';

export default function FinanceQuickCreate({ businessId, contacts, onSaved }: {
  businessId: string;
  contacts: FinanceContact[];
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

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
      await onSaved(); formElement.reset(); setNotice('Contact saved.');
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
        kind: String(form.get('kind')) as 'receivable' | 'payable',
        description: String(form.get('description') ?? '').trim(),
        amount: Number(form.get('amount')),
        due_date: String(form.get('due_date') ?? '') || null,
      });
      await onSaved(); formElement.reset(); setNotice('Obligation saved.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save the obligation.'); }
    finally { setBusy(false); }
  }

  return <details className="mb-5 rounded-xl border border-[#111B33]/10 bg-white"><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-xs font-black"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><Plus className="h-4 w-4" /></span>Add a customer, supplier, or balance</summary><div className="grid gap-4 border-t border-[#111B33]/10 p-4 lg:grid-cols-2"><form onSubmit={saveContact} className="grid content-start gap-3 rounded-lg border border-[#111B33]/[.08] p-4"><h2 className="text-xs font-black">New contact</h2><select name="kind" className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs"><option value="customer">Customer</option><option value="supplier">Supplier</option></select><input name="name" required maxLength={120} placeholder="Name" className="h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><div className="grid grid-cols-2 gap-2"><input name="email" type="email" placeholder="Email (optional)" className="min-w-0 h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><input name="phone" placeholder="Phone (optional)" className="min-w-0 h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /></div><button disabled={busy || !businessId} className="h-10 rounded-lg bg-[#111B33] px-4 text-xs font-black text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save contact'}</button></form><form onSubmit={saveObligation} className="grid content-start gap-3 rounded-lg border border-[#111B33]/[.08] p-4"><h2 className="text-xs font-black">New customer balance or supplier bill</h2><select name="kind" className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs"><option value="receivable">Customer owes the business</option><option value="payable">Business owes supplier</option></select><select name="contact" required className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs"><option value="">Choose a contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.kind}</option>)}</select><input name="description" required maxLength={160} placeholder="Invoice or bill description" className="h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><div className="grid grid-cols-2 gap-2"><input name="amount" type="number" min="0.01" step="0.01" required placeholder="Outstanding amount" className="min-w-0 h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /><input name="due_date" type="date" className="min-w-0 h-10 rounded-lg border border-[#111B33]/15 px-3 text-xs" /></div><button disabled={busy || !businessId || !contacts.length} className="h-10 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white disabled:opacity-50">{busy ? 'Saving…' : contacts.length ? 'Save balance' : 'Add a contact first'}</button></form></div>{notice && <p role="status" className="px-4 pb-4 text-xs text-[#64708A]">{notice}</p>}</details>;
}
