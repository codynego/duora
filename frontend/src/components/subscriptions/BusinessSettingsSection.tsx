'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CircleDollarSign } from 'lucide-react';
import { updateFinanceBusiness, type FinanceBusiness } from '@/lib/finance-api';

const countries = [
  { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
];
const currencies = [
  ['NGN', 'Nigerian naira (₦)'], ['GHS', 'Ghanaian cedi (GH₵)'], ['KES', 'Kenyan shilling (KSh)'],
  ['ZAR', 'South African rand (R)'], ['GBP', 'British pound (£)'], ['USD', 'US dollar ($)'], ['EUR', 'Euro (€)'],
];
const businessTypes = ['Sole proprietor', 'Partnership', 'Limited company', 'Other'];
const industries = ['Retail and trade', 'Food and agriculture', 'Professional services', 'Manufacturing', 'Health and education', 'Other'];

export default function BusinessSettingsSection({ business, currencyLocked, onSaved }: {
  business: FinanceBusiness | null;
  currencyLocked: boolean;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business) return;
    const form = new FormData(event.currentTarget);
    setSaving(true); setNotice(''); setError('');
    try {
      await updateFinanceBusiness(business.id, {
        name: String(form.get('name') ?? '').trim(),
        business_type: String(form.get('business_type') ?? ''),
        industry: String(form.get('industry') ?? ''),
        country: String(form.get('country') ?? ''),
        currency: currencyLocked ? undefined : String(form.get('currency') ?? ''),
        record_keeping: String(form.get('record_keeping') ?? ''),
      });
      try {
        const stored = JSON.parse(window.localStorage.getItem('dorah:financial-controller:onboarding') || '{}');
        window.localStorage.setItem('dorah:financial-controller:onboarding', JSON.stringify({ ...stored, country: String(form.get('country') ?? '') }));
      } catch { /* The saved business country remains the source of truth. */ }
      await onSaved();
      setNotice('Business settings saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your business settings.');
    } finally { setSaving(false); }
  }

  return <div className="grid gap-6">
    <header><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Workspace preferences</p><h1 className="mt-2 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black tracking-[-.07em] sm:text-5xl">Business settings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#64708A]">Keep your business details and reporting currency accurate. These settings apply to this financial workspace.</p></header>
    {!business ? <section className="rounded-xl border border-[#111B33]/10 bg-white p-6"><h2 className="text-lg font-black">Set up your business first</h2><p className="mt-2 text-sm leading-6 text-[#64708A]">Complete the short business setup to manage your workspace profile and primary currency here.</p><Link href="/onboarding" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white">Complete business setup <ArrowRight className="h-4 w-4" /></Link></section> : <>
      <section className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><div className="flex items-center gap-3 border-b border-[#111B33]/[.08] pb-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><BriefcaseBusiness className="h-5 w-5" /></span><div><h2 className="text-sm font-black">Business profile</h2><p className="mt-1 text-xs text-[#758096]">Used to organize and explain your financial records.</p></div></div>
        <form onSubmit={(event) => void save(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-bold text-[#536078] sm:col-span-2">Business name<input name="name" key={business.id + business.name} defaultValue={business.name} required maxLength={100} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Business type<select name="business_type" key={business.id + business.business_type} defaultValue={business.business_type} required className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{businessTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Industry<select name="industry" key={business.id + business.industry} defaultValue={business.industry} required className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{industries.map((industry) => <option key={industry}>{industry}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Country<select name="country" key={business.id + business.country} defaultValue={business.country} required className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Primary business currency<select name="currency" key={business.id + business.currency} defaultValue={business.currency} required disabled={currencyLocked} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7FB] disabled:text-[#758096]">{currencies.map(([code, label]) => <option key={code} value={code}>{code} — {label}</option>)}</select><span className="text-[10px] font-normal leading-4 text-[#758096]">{currencyLocked ? 'Currency is locked after you add accounts, transactions, or outstanding balances.' : 'This currency is used for your main financial overview and reports.'}</span></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078] sm:col-span-2">How you keep records<select name="record_keeping" key={business.id + business.record_keeping} defaultValue={business.record_keeping || ''} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"><option value="">Choose how you keep records</option><option value="paper">Notebook or paper</option><option value="digital">Excel or another digital tool</option><option value="unorganized">I don’t keep organized records</option></select></label>
          {error && <p role="alert" className="rounded-lg bg-[#FFF0F0] p-3 text-xs text-[#A4362B] sm:col-span-2">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-[#A5CD4A] bg-[#F2FADA] p-3 text-xs text-[#496436] sm:col-span-2">{notice}</p>}
          <button disabled={saving} aria-busy={saving} className="button-loading h-11 w-fit rounded-lg bg-[#3157F5] px-5 text-xs font-black text-white disabled:opacity-50 sm:col-span-2">{saving ? 'Saving…' : 'Save business settings'}</button>
        </form>
      </section>
      <div className="grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><CircleDollarSign className="h-4 w-4" /></span><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#758096]">Current plan</p><h2 className="mt-1 text-lg font-black capitalize">{business.plan}</h2></div></div><p className="mt-3 text-xs leading-5 text-[#64708A]">Compare plan limits and choose the level of financial oversight that fits your business.</p><Link href="/pricing" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">View plans <ArrowRight className="h-4 w-4" /></Link></article><article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#758096]">Workspace access</p><h2 className="mt-2 text-lg font-black">Business owner</h2><p className="mt-2 text-xs leading-5 text-[#64708A]">This workspace currently belongs to your account. Team access and approval roles are not enabled yet.</p></article></div>
    </>}
  </div>;
}
