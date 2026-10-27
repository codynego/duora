import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'About',
  description: 'Learn why Dorah is building a clearer, evidence-led financial controller for small businesses and how the product approaches business money.',
  path: '/about',
});

export default function AboutPage() {
  return <PublicGuidePage kicker="About Dorah" title="Business finances deserve a clearer view" description="Dorah is being built to help small-business owners understand the money moving through their business, the balances still outstanding, and the records that may need a closer look." sections={[
    { title: 'Built around daily business decisions', body: 'Many owners keep useful financial details across receipts, notebooks, spreadsheets, and messages. Dorah brings the records you choose to add into one workspace for a clearer day-to-day view.', points: ['See income and expenses together', 'Keep customer balances and supplier bills visible', 'Review recorded cash and financial performance'] },
    { title: 'Clarity before complexity', body: 'Dorah focuses on the questions a business owner needs to answer regularly: what came in, what went out, who still owes the business, and what bills are coming due.', points: ['A focused workspace for one business', 'A primary reporting currency selected by the owner', 'Optional setup so owners can start without importing everything'] },
    { title: 'Evidence should come with an insight', body: 'A financial check is useful only when an owner can inspect the records behind it. Dorah presents rule-based findings with supporting transactions or balances, and treats possible matches as something to review—not as a confirmed mistake.' },
    { title: 'Technology with clear limits', body: 'Dorah helps organize financial information and surface patterns in recorded data. It does not replace a qualified accountant, guarantee that records are complete, or make business decisions for the owner.' },
  ]} related={[{ label: 'Explore product features', href: '/features' }, { label: 'See how it works', href: '/how-it-works' }, { label: 'Compare plans', href: '/pricing' }]} />;
}
