import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, ChevronRight, Scale } from 'lucide-react';
import { breadcrumbSchema, publicPageMetadata, SITE_URL } from '@/lib/seo';
import { comparisonPages } from '@/lib/comparison-pages';

export function generateStaticParams() { return comparisonPages.map(({ slug }) => ({ competitor: slug })); }
function getPage(slug: string) { return comparisonPages.find((page) => page.slug === slug); }

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const page = getPage((await params).competitor);
  if (!page) return {};
  return publicPageMetadata({ title: page.title, description: page.description, path: `/compare/dorah-vs-${page.slug}`, keywords: [`Dorah vs ${page.competitor}`, `${page.competitor} alternative`, 'small business finance software'] });
}

export default async function ComparisonPage({ params }: { params: Promise<{ competitor: string }> }) {
  const page = getPage((await params).competitor);
  if (!page) notFound();
  const path = `/compare/dorah-vs-${page.slug}`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: page.title, description: page.description, inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Comparisons', path: '/compare' }, { name: page.title, path }]),
    ...(page.article ? [
      { '@type': 'Article', '@id': `${SITE_URL}${path}#article`, headline: page.title, description: page.description, image: `${SITE_URL}/dorah-social-preview.png`, datePublished: '2026-10-30', dateModified: '2026-10-30', inLanguage: 'en-NG', author: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` }, mainEntityOfPage: { '@id': `${SITE_URL}${path}#webpage` } },
      { '@type': 'FAQPage', '@id': `${SITE_URL}${path}#faq`, mainEntity: page.article.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ] : []),
  ] };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <main className="overflow-hidden bg-[#F5F7FB] text-[#111B33]">
      <section className="relative bg-[#111B33] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-24 sm:pt-14"><div aria-hidden="true" className="absolute -right-24 -top-32 h-96 w-96 rounded-full border-[34px] border-[#3157F5]/30" /><div className="relative mx-auto max-w-6xl"><nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-bold text-white/45"><Link href="/" className="hover:text-white">Home</Link><ChevronRight className="h-3 w-3" /><Link href="/compare" className="hover:text-white">Comparisons</Link><ChevronRight className="h-3 w-3" /><span className="text-[#C9F45D]">{page.competitor}</span></nav><div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]"><Scale className="h-4 w-4" /> A practical comparison</p><h1 className="mt-6 max-w-4xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.94] tracking-[-.075em] sm:text-7xl">{page.title}<span className="text-[#C9F45D]">.</span></h1></div><div className="border-l border-white/15 pl-5"><p className="text-base leading-8 text-white/70 sm:text-lg">{page.description}</p><p className="mt-5 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Best for</p><p className="mt-2 text-sm font-bold leading-6 text-white">{page.bestFor}</p></div></div></div></section>

      <section className="px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-6xl"><div className="grid overflow-hidden rounded-2xl border border-[#111B33]/10 bg-white shadow-[0_18px_50px_rgba(17,27,51,.06)] lg:grid-cols-2"><div className="bg-[#3157F5] p-7 text-white sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#C9F45D]">The Dorah angle</p><h2 className="mt-5 text-3xl font-black tracking-[-.06em] sm:text-4xl">A clearer view of the money behind the work.</h2><p className="mt-5 text-sm leading-7 text-white/75">{page.dorahAngle}</p><Link href="/features" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#C9F45D]">Explore the features <ArrowRight className="h-4 w-4" /></Link></div><div className="p-7 sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#3157F5]">What to compare</p><ul className="mt-5 divide-y divide-[#111B33]/10">{page.differences.map((difference) => <li key={difference} className="flex gap-3 py-4 text-sm leading-6 text-[#536078]"><Check className="mt-1 h-4 w-4 shrink-0 text-[#557516]" />{difference}</li>)}</ul></div></div></div></section>

      <section className="border-y border-[#111B33]/10 bg-white px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">The decision in plain language</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em] sm:text-5xl">Which workflow sounds like your business?</h2></div><div className="mt-10 grid gap-4 md:grid-cols-2">{page.questions.map((question, index) => <article key={question.title} className={`rounded-2xl p-7 sm:p-8 ${index === 0 ? 'bg-[#111B33] text-white' : 'border border-[#111B33]/10 bg-[#F8F9FC]'}`}><p className={`text-[10px] font-black uppercase tracking-[.14em] ${index === 0 ? 'text-[#C9F45D]' : 'text-[#3157F5]'}`}>{index === 0 ? 'Dorah may fit when' : `${page.competitor} may fit when`}</p><h3 className="mt-4 text-2xl font-black tracking-[-.05em]">{question.title}</h3><p className={`mt-4 text-sm leading-7 ${index === 0 ? 'text-white/70' : 'text-[#64708A]'}`}>{question.body}</p></article>)}</div></div></section>

      {page.article && <section className="px-5 py-14 sm:px-8 sm:py-20"><article className="mx-auto max-w-4xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">A detailed comparison</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em] sm:text-5xl">Dorah vs {page.competitor}: which is right for your business?</h2><p className="mt-6 text-lg leading-8 text-[#536078]">{page.article.intro}</p><div className="mt-12">{page.article.sections.map((section) => <section key={section.heading} className="mt-10 first:mt-0"><h3 className="text-2xl font-black tracking-[-.05em] sm:text-3xl">{section.heading}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-sm leading-7 text-[#536078] sm:text-base">{paragraph}</p>)}</section>)}</div><section className="mt-12"><h3 className="text-2xl font-black tracking-[-.05em]">Common questions</h3><div className="mt-5 grid gap-3">{page.article.faqs.map((faq) => <details key={faq.question} className="rounded-xl border border-[#111B33]/[.08] bg-white p-5"><summary className="cursor-pointer text-sm font-black">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-[#64708A]">{faq.answer}</p></details>)}</div></section></article></section>}

      <section className="bg-[#C9F45D] px-5 py-14 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Choose with context</p><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-.06em] sm:text-4xl">The best tool is the one you can keep using.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#31502D]">Compare the workflows that matter to your business, then start with the records you already understand.</p></div><Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#111B33] px-5 py-3 text-xs font-black text-white transition hover:bg-[#3157F5]">Start with Dorah <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section className="px-5 pb-20 pt-10 sm:px-8"><div className="mx-auto max-w-6xl border-t border-[#111B33]/10 pt-8"><p className="max-w-3xl text-xs leading-6 text-[#758096]">Product capabilities, pricing, integrations, and regional availability can change. Confirm the workflows and requirements that matter to your business before choosing a tool.</p><div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-[#64708A]"><Link href="/compare" className="hover:text-[#3157F5]">All comparisons <span aria-hidden="true">→</span></Link><Link href="/features" className="hover:text-[#3157F5]">See Dorah features <span aria-hidden="true">→</span></Link><Link href="/contact" className="hover:text-[#3157F5]">Ask a question <span aria-hidden="true">→</span></Link></div></div></section>
    </main>
  </>;
}
