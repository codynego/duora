'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, FileSpreadsheet, NotebookPen, Sparkles, WalletCards } from 'lucide-react';
import { saveFinancialOnboardingProfile, type FinancialOnboardingProfile, type RecordKeeping, type SetupChoice } from '@/lib/financial-onboarding';
import { createBusiness, getBusinesses } from '@/lib/finance-api';

const countries = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
  { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
];

const currencies = [
  { code: 'NGN', name: 'Nigerian naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian cedi', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African rand', symbol: 'R' },
  { code: 'GBP', name: 'British pound', symbol: '£' },
  { code: 'USD', name: 'US dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const businessTypes = ['Sole proprietor', 'Partnership', 'Limited company', 'Other'];
const industries = ['Retail and trade', 'Food and agriculture', 'Professional services', 'Manufacturing', 'Health and education', 'Other'];

const recordsChoices: { value: RecordKeeping; title: string; description: string; icon: typeof NotebookPen }[] = [
  { value: 'paper', title: 'Notebook or paper', description: 'I write things down or keep receipts.', icon: NotebookPen },
  { value: 'digital', title: 'Excel or another digital tool', description: 'I use spreadsheets or a different app.', icon: FileSpreadsheet },
  { value: 'unorganized', title: "I don't keep organized records", description: "I'm ready to start from where I am.", icon: Sparkles },
];

const setupChoices: { value: Exclude<SetupChoice, 'skipped'>; title: string; description: string; icon: typeof NotebookPen }[] = [
  { value: 'balances', title: 'Enter current balances', description: 'Add the starting amounts you know now.', icon: WalletCards },
  { value: 'import', title: 'Import existing records', description: 'Bring in a supported spreadsheet when you’re ready.', icon: FileSpreadsheet },
  { value: 'fresh', title: 'Start fresh', description: 'Begin recording activity from today.', icon: ArrowRight },
];

function Brand() {
  return <a href="/" className="inline-flex items-center gap-2 font-[Aptos_Display,Arial,sans-serif] text-xl font-black tracking-[-.06em]"><span className="flex h-9 w-9 items-end justify-center gap-0.5 rounded-[10px] bg-[#3157F5] p-2 -rotate-3"><i className="h-2 w-1 rounded-t bg-white" /><i className="h-5 w-1 rounded-t bg-white" /><i className="h-3.5 w-1 rounded-t bg-white" /></span>Dorah</a>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('NG');
  const [currency, setCurrency] = useState('NGN');
  const [currencyChanged, setCurrencyChanged] = useState(false);
  const [recordKeeping, setRecordKeeping] = useState<RecordKeeping | ''>('');
  const [setupChoice, setSetupChoice] = useState<Exclude<SetupChoice, 'skipped'> | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCountry = countries.find((item) => item.code === country) ?? countries[0];

  async function finish(choice: SetupChoice) {
    setSaving(true);
    setError('');
    const profile: FinancialOnboardingProfile = {
      businessName: businessName.trim(), businessType, industry, country,
      currency, recordKeeping: recordKeeping as RecordKeeping, setupChoice: choice,
    };
    try {
      const businesses = await getBusinesses();
      if (!businesses.length) {
        await createBusiness({
          name: profile.businessName,
          business_type: profile.businessType,
          industry: profile.industry,
          country: profile.country,
          currency: profile.currency,
          record_keeping: profile.recordKeeping,
          setup_choice: profile.setupChoice,
        });
      }
      try { saveFinancialOnboardingProfile(profile); } catch { /* The business profile is already saved on the server. */ }
      router.replace('/dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not save your business setup. Please try again.');
      setSaving(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else void finish(setupChoice || 'skipped');
  }

  return <main className="min-h-screen bg-[#F5F7FB] text-[#111B33] lg:grid lg:grid-cols-[1fr_.72fr]">
    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-9">
      <Brand />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
        <div className="mb-8"><div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[.13em] text-[#64708A]"><span>Business setup</span><span>Step {step} of 3</span></div><div className="mt-3 grid grid-cols-3 gap-2" aria-label={`Step ${step} of 3`}>{[1, 2, 3].map((item) => <span key={item} className={`h-1 rounded-full ${item <= step ? 'bg-[#3157F5]' : 'bg-[#111B33]/10'}`} />)}</div></div>

        {step === 1 && <>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" /> A little about your business</p>
          <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">Tell us about your business.</h1>
          <p className="mt-3 text-sm leading-6 text-[#64708A]">This helps Dorah put your financial activity in context.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4">
            <label className="grid gap-1.5 text-xs font-black text-[#536078]">Business name<input autoFocus required maxLength={100} value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="e.g. Amina’s Kitchen" className="h-12 rounded-lg border border-[#111B33]/15 bg-white px-4 text-sm font-medium text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-black text-[#536078]">Business type<select required value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="h-12 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-medium text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"><option value="">Choose a type</option>{businessTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="grid gap-1.5 text-xs font-black text-[#536078]">Industry<select required value={industry} onChange={(event) => setIndustry(event.target.value)} className="h-12 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-medium text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"><option value="">Choose an industry</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-black text-[#536078]">Country where your business operates<select required value={country} onChange={(event) => { const nextCountry = countries.find((item) => item.code === event.target.value); setCountry(event.target.value); if (!currencyChanged && nextCountry) setCurrency(nextCountry.currency); }} className="h-12 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-medium text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="grid gap-1.5 text-xs font-black text-[#536078]">Primary business currency<select required value={currency} onChange={(event) => { setCurrency(event.target.value); setCurrencyChanged(true); }} className="h-12 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-medium text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{currencies.map((item) => <option key={item.code} value={item.code}>{item.code} — {item.name} ({item.symbol})</option>)}</select></label></div><p className="-mt-2 text-[10px] leading-5 text-[#758096]">This currency is used for your main overview and reports. Choose the currency you use most, even if it differs from your country. You can change it later in settings.</p>
            <button className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_4px_0_rgba(49,87,245,.18)]">Continue <ArrowRight className="h-4 w-4" /></button>
          </form>
        </>}

        {step === 2 && <>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" /> No wrong answer</p>
          <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">How do you manage your records today?</h1>
          <p className="mt-3 text-sm leading-6 text-[#64708A]">We’ll suggest a useful first step. You don’t need to import anything now.</p>
          <form onSubmit={submit} className="mt-7 grid gap-3">{recordsChoices.map(({ value, title, description, icon: Icon }) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${recordKeeping === value ? 'border-[#3157F5] bg-[#EEF1FF]' : 'border-[#111B33]/12 bg-white hover:border-[#3157F5]/40'}`}><input type="radio" name="recordKeeping" value={value} required checked={recordKeeping === value} onChange={() => setRecordKeeping(value)} className="h-4 w-4 accent-[#3157F5]" /><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#3157F5]"><Icon className="h-4 w-4" /></span><span><strong className="block text-sm font-black">{title}</strong><small className="mt-1 block text-xs leading-5 text-[#64708A]">{description}</small></span></label>)}<div className="mt-3 flex gap-3"><button type="button" onClick={() => setStep(1)} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#111B33]/15 bg-white px-4 text-sm font-black"><ArrowLeft className="h-4 w-4" />Back</button><button className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_4px_0_rgba(49,87,245,.18)]">Continue <ArrowRight className="h-4 w-4" /></button></div></form>
        </>}

        {step === 3 && <>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" /> Optional setup</p>
          <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">How would you like to begin?</h1>
          <p className="mt-3 text-sm leading-6 text-[#64708A]">Pick one if it’s useful. You can skip this and decide later.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
          <form onSubmit={submit} className="mt-7 grid gap-3">{setupChoices.map(({ value, title, description, icon: Icon }) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${setupChoice === value ? 'border-[#3157F5] bg-[#EEF1FF]' : 'border-[#111B33]/12 bg-white hover:border-[#3157F5]/40'}`}><input type="radio" name="setupChoice" value={value} checked={setupChoice === value} onChange={() => setSetupChoice(value)} className="h-4 w-4 accent-[#3157F5]" /><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#3157F5]"><Icon className="h-4 w-4" /></span><span><strong className="block text-sm font-black">{title}</strong><small className="mt-1 block text-xs leading-5 text-[#64708A]">{description}</small></span></label>)}<div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row"><button type="button" disabled={saving} onClick={() => void finish('skipped')} className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-[#111B33]/15 bg-white px-4 text-sm font-black disabled:opacity-60">{saving ? 'Saving…' : 'Skip for now'}</button><button disabled={saving} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_4px_0_rgba(49,87,245,.18)] disabled:opacity-60">{saving ? 'Saving…' : 'Go to overview'} {!saving && <ArrowRight className="h-4 w-4" />}</button></div></form>
          <p className="mt-4 flex items-center gap-2 text-[10px] leading-5 text-[#758096]"><Check className="h-3.5 w-3.5 shrink-0 text-[#557516]" />You can complete setup gradually from your dashboard.</p>
        </>}
      </div>
      <p className="mx-auto w-full max-w-xl text-[10px] text-[#758096]">Usually under 90 seconds · You can finish financial setup later</p>
    </section>

    <aside className="hidden flex-col justify-end bg-[#111B33] p-12 text-white lg:flex"><div className="mb-auto text-right text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">Dorah / financial intelligence</div><span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#C9F45D]/40 text-[#C9F45D]"><BriefcaseBusiness className="h-6 w-6" /></span><h2 className="mt-7 max-w-lg font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.92] tracking-[-.07em]">Start with what you have.</h2><p className="mt-5 max-w-md text-sm leading-7 text-white/60">No perfect books required. Tell us a little about your business, then build a clearer picture one step at a time.</p><div className="mt-10 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[.1em] text-white/55"><span className={step >= 1 ? 'text-[#C9F45D]' : ''}>Business</span><span className={step >= 2 ? 'text-[#C9F45D]' : ''}>Records</span><span className={step >= 3 ? 'text-[#C9F45D]' : ''}>Get started</span></div></aside>
  </main>;
}
