import type { Metadata } from 'next';
import { ArrowRight, Cable, Smartphone, Tv, Zap } from 'lucide-react';
import MarketplaceShell from '@/components/subscriptions/MarketplaceShell';

export const metadata: Metadata = { title: 'Buy essentials — Dorah', robots: { index: false, follow: false } };

const products = [
  { label: 'Airtime', detail: 'Top up any network', icon: Smartphone },
  { label: 'Data', detail: 'Keep your line connected', icon: Cable },
  { label: 'Electricity', detail: 'Pay your power bill', icon: Zap },
  { label: 'TV', detail: 'Renew your entertainment plan', icon: Tv },
];

export default function BuyPage() {
  return <MarketplaceShell><main className="min-h-screen bg-[#F5F7FB] px-5 py-10 text-[#111B33] sm:px-8 sm:py-16"><div className="mx-auto max-w-5xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Dorah essentials</p><h1 className="mt-3 text-5xl font-black tracking-[-.08em] sm:text-7xl">Buy what keeps<br />life moving.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-[#64708A]">Airtime, data, electricity, and TV payments in one place.</p><section className="mt-10 grid gap-4 sm:grid-cols-2">{products.map(({ label, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-[#111B33]/10 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#EEF1FF] text-[#3157F5]"><Icon className="h-5 w-5" /></span><h2 className="mt-6 text-xl font-black">{label}</h2><p className="mt-1 text-sm text-[#758096]">{detail}</p><button disabled className="mt-6 inline-flex items-center gap-2 text-xs font-black text-[#758096]">Coming soon <ArrowRight className="h-4 w-4" /></button></article>)}</section></div></main></MarketplaceShell>;
}
