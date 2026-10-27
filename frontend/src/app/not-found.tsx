import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F5F7FB] px-5 py-12 text-[#111B33]">
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#C9F45D]/35 blur-3xl" />
      <div className="absolute -bottom-36 -right-24 h-96 w-96 rounded-full bg-[#3157F5]/15 blur-3xl" />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#111B33]/10 bg-white shadow-[0_24px_70px_rgba(17,27,51,.1)]">
        <div className="bg-[#111B33] p-7 text-white sm:p-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-[Aptos_Display,Arial,sans-serif] text-xl font-black tracking-[-.06em]">Dorah</Link>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#C9F45D]">404</span>
          </div>
          <div className="mt-16 max-w-lg">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">This page moved</p>
            <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.88] tracking-[-.08em] sm:text-7xl">Nothing to<br />review here.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/65">The page you’re looking for doesn’t exist or may have been moved. Your business records are still safe.</p>
          </div>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8">
          <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-4 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.18)] transition hover:bg-[#2748D8]"><ArrowLeft className="h-4 w-4" />Go home</Link>
          <Link href="/dashboard" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#111B33]/15 px-4 text-sm font-black transition hover:border-[#3157F5] hover:text-[#3157F5]"><ArrowRight className="h-4 w-4" />Open dashboard</Link>
          <Link href="/help" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#111B33]/15 px-4 text-sm font-black transition hover:border-[#3157F5] hover:text-[#3157F5]"><Search className="h-4 w-4" />Visit help</Link>
        </div>
      </section>
    </main>
  );
}
