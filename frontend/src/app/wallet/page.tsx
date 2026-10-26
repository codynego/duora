import type { Metadata } from 'next';
import { ArrowRight, ReceiptText, WalletCards } from 'lucide-react';
import Link from 'next/link';
import MarketplaceShell from '@/components/subscriptions/MarketplaceShell';

export const metadata: Metadata = { title: 'Wallet & transactions — Dorah', robots: { index: false, follow: false } };

export default function WalletPage() {
  return <MarketplaceShell><main className="min-h-screen bg-[#F5F7FB] px-5 py-10 text-[#111B33] sm:px-8 sm:py-16"><div className="mx-auto max-w-4xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Your money</p><h1 className="mt-3 text-5xl font-black tracking-[-.08em] sm:text-7xl">Wallet &amp;<br />transactions.</h1><section className="mt-10 rounded-2xl bg-[#111B33] p-7 text-white sm:p-9"><WalletCards className="h-6 w-6 text-[#C9F45D]" /><p className="mt-8 text-xs font-bold text-white/55">Available balance</p><strong className="mt-2 block text-5xl font-black tracking-[-.07em]">₦0</strong><p className="mt-2 text-xs text-white/50">Your Dorah wallet is ready for refunds and credits.</p></section><section className="mt-8 rounded-2xl border border-[#111B33]/10 bg-white p-7"><div className="flex items-center gap-3"><ReceiptText className="h-5 w-5 text-[#3157F5]" /><h2 className="text-lg font-black">Recent transactions</h2></div><div className="py-12 text-center"><p className="text-sm font-bold">No transactions yet.</p><p className="mt-2 text-xs text-[#758096]">Your payments, refunds, and credits will appear here.</p><Link href="/marketplace" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">Browse marketplace <ArrowRight className="h-4 w-4" /></Link></div></section></div></main></MarketplaceShell>;
}
