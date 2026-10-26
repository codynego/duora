// @ts-nocheck
"use client";

import type { Metadata } from 'next';
import { ArrowRight, Cable, Check, Smartphone, Tv, Zap } from 'lucide-react';
import { useState } from 'react';
import MarketplaceShell from '@/components/subscriptions/MarketplaceShell';

const suggestions = [
  { label: '9mobile data', detail: '10 GB · 30 days', price: '₦2,900', oldPrice: '₦3,500', icon: Smartphone, color: '#3157F5' },
  { label: 'MTN airtime', detail: '₦5,000 credit', price: '₦4,850', oldPrice: '₦5,000', icon: Smartphone, color: '#E4A900' },
  { label: 'Ikeja electric', detail: '₦10,000 token', price: '₦9,700', oldPrice: '₦10,000', icon: Zap, color: '#D86A28' },
  { label: 'DStv Compact', detail: '30 days access', price: '₦14,500', oldPrice: '₦15,000', icon: Tv, color: '#7B4BD1' },
];

export const metadata: Metadata = { title: 'Buy essentials — Dorah', robots: { index: false, follow: false } };

export default function BuyPage() {
  // The quick-link icon tuple is intentionally data-driven for the compact utility row.
  const [bought, setBought] = useState('');
  return <MarketplaceShell active="buy"><main className="min-h-screen bg-[#F5F7FB] px-5 py-10 text-[#111B33] sm:px-8 sm:py-16"><div className="mx-auto max-w-5xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Dorah essentials</p><h1 className="mt-3 text-5xl font-black tracking-[-.08em] sm:text-7xl">Buy what keeps<br />life moving.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-[#64708A]">Quick, discounted access for everyday bills.</p><section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Suggested for you</p><h2 className="mt-2 text-2xl font-black tracking-[-.05em] sm:text-4xl">Save on your next top-up.</h2></div><span className="text-xs font-bold text-[#758096]">Demo offers</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{suggestions.map(({ label, detail, price, oldPrice, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-[#111B33]/10 bg-white p-4"><div className="flex items-start justify-between"><span style={{ backgroundColor: color }} className="grid h-10 w-10 place-items-center rounded-xl text-white"><Icon className="h-5 w-5" /></span><span className="rounded-full bg-[#EDF8DC] px-2 py-1 text-[10px] font-black text-[#557516]">Save 3–17%</span></div><h3 className="mt-5 font-black">{label}</h3><p className="mt-1 text-xs text-[#758096]">{detail}</p><div className="mt-4 flex items-end justify-between gap-3"><div><strong className="text-xl">{price}</strong><del className="ml-2 text-xs text-[#9BA3B2]">{oldPrice}</del></div><button onClick={() => setBought(label)} className="inline-flex items-center gap-1 rounded-lg bg-[#3157F5] px-3 py-2 text-xs font-black text-white">Buy now <ArrowRight className="h-3.5 w-3.5" /></button></div></article>)}</div>{bought && <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#A5CD4A] bg-[#F2FADA] px-3 py-2 text-xs font-bold text-[#46661A]"><Check className="h-4 w-4" />{bought} added to checkout. Payment integration coming next.</p>}</section><section className="mt-12 grid gap-3 sm:grid-cols-4">{[['Airtime', Smartphone], ['Data', Cable], ['Electricity', Zap], ['TV', Tv]].map(([label, Icon]) => <button key={String(label)} className="flex items-center gap-3 rounded-xl border border-[#111B33]/10 bg-white p-4 text-left text-sm font-black"><Icon className="h-4 w-4 text-[#3157F5]" />{label}</button>)}</section></div></main></MarketplaceShell>;
}
