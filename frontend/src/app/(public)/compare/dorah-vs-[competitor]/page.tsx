import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import SeoLandingPage from '@/components/SeoLandingPage';
import { comparisonPages } from '@/lib/comparison-pages';
import { publicPageMetadata } from '@/lib/seo';

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
  return <>
    <SeoLandingPage path={`/compare/dorah-vs-${page.slug}`} kicker={`Dorah vs ${page.competitor}`} title={page.title} description={page.description} audience={page.bestFor} sections={[{ title: 'Where Dorah fits', body: page.dorahAngle, points: page.differences }, ...page.questions.map((question) => ({ title: question.title, body: question.body, points: [] }))]} related={[{ label: 'All comparisons', href: '/compare' }, { label: 'See Dorah features', href: '/features' }, { label: 'Start free', href: '/signup' }]} />
    <section className="bg-[#F5F7FB] px-5 pb-20 text-[#111B33] sm:px-8"><div className="mx-auto max-w-6xl border-t border-[#111B33]/10 pt-10"><p className="text-sm leading-7 text-[#64708A]">Product capabilities and availability can change. Confirm the workflows, pricing, integrations, and regional requirements that matter to your business before choosing a tool.</p><Link href="/compare" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">Explore all comparisons <ArrowRight className="h-4 w-4" /></Link></div></section>
  </>;
}
