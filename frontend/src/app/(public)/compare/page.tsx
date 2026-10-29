import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { publicPageMetadata } from '@/lib/seo';
import { comparisonPages } from '@/lib/comparison-pages';

export const metadata: Metadata = publicPageMetadata({ title: 'Dorah Comparisons', description: 'Compare Dorah with popular small-business finance and accounting tools, and choose the financial workflow that fits your business.', path: '/compare', keywords: ['Dorah alternatives', 'Dorah vs QuickBooks', 'Dorah vs Xero', 'Dorah vs FreshBooks', 'Dorah vs Sage', 'Dorah vs Odoo', 'Dorah vs Excel', 'small business finance software comparison'] });

export default function ComparePage() {
  const coreComparisons = comparisonPages.slice(0, 4);
  const moreComparisons = comparisonPages.slice(4);

  return <main className="overflow-hidden bg-[#F5F7FB] text-[#111B33]">
    <section className="relative bg-[#111B33] px-5 pb-16 pt-14 text-white sm:px-8 sm:pb-24 sm:pt-20">
      <div className="absolute -right-24 top-[-7rem] h-80 w-80 rounded-full border-[30px] border-[#C9F45D]/20" />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]"><Sparkles className="h-3.5 w-3.5" /> A clearer way to choose</p><h1 className="mt-6 max-w-4xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.94] tracking-[-.075em] sm:text-7xl">Dorah vs the tools already on your shortlist<span className="text-[#C9F45D]">.</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">Compare the workflow, not just the feature checklist. See where Dorah helps owners understand business money—and where another product may be the better fit.</p></div>
        <div className="border-l border-white/15 pl-6 lg:mb-1"><p className="text-xs font-black uppercase tracking-[.14em] text-white/45">Every comparison covers</p><div className="mt-5 space-y-4 text-sm text-white/80"><p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9F45D]" />The kind of owner each tool suits</p><p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9F45D]" />The financial workflow each one prioritises</p><p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9F45D]" />The honest trade-offs before you choose</p></div></div>
      </div>
    </section>
    <section className="px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Popular starting points</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em] sm:text-5xl">Compare the names you hear most.</h2><p className="mt-4 text-sm leading-7 text-[#64708A]">Start with the established accounting and finance tools most likely to appear in your research.</p></div><section className="mt-10 grid gap-4 md:grid-cols-2">{coreComparisons.map((page) => <ComparisonCard key={page.slug} page={page} />)}</section></div></section>
    <section className="border-t border-[#111B33]/10 bg-white px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">More ways to compare</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em] sm:text-5xl">Different tools. Same useful question.</h2></div><p className="max-w-sm text-sm leading-7 text-[#64708A]">Not every business needs the same depth. These comparisons cover lighter tools, broader suites, and the spreadsheet stage.</p></div><section className="mt-10 grid gap-4 md:grid-cols-3">{moreComparisons.map((page) => <ComparisonCard key={page.slug} page={page} compact />)}</section></div></section>
    <section className="bg-[#C9F45D] px-5 py-14 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Still deciding?</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-.06em] sm:text-4xl">See how Dorah keeps the everyday money picture together.</h2></div><Link href="/features" className="inline-flex items-center gap-2 rounded-full bg-[#111B33] px-5 py-3 text-xs font-black text-white transition hover:bg-[#3157F5]">Explore the features <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main>;
}

function ComparisonCard({ page, compact = false }: { page: (typeof comparisonPages)[number]; compact?: boolean }) {
  return <Link href={`/compare/dorah-vs-${page.slug}`} className={`group flex h-full flex-col rounded-2xl border border-[#111B33]/[.08] bg-[#F8F9FC] p-6 transition hover:-translate-y-1 hover:border-[#3157F5]/30 hover:bg-white hover:shadow-[0_14px_36px_rgba(17,27,51,.07)] ${compact ? 'p-5' : 'sm:p-7'}`}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Dorah vs</p><h3 className="mt-3 text-2xl font-black tracking-[-.05em]">{page.competitor}</h3></div><ArrowRight className="mt-1 h-5 w-5 text-[#3157F5] transition group-hover:translate-x-1" /></div><p className="mt-4 text-sm leading-7 text-[#64708A]">{page.description}</p><span className="mt-auto pt-6 text-xs font-black text-[#111B33]">Read comparison <span className="text-[#3157F5]">↗</span></span></Link>;
}
