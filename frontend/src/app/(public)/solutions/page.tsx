import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Small Business Finance Solutions', description: 'Practical financial oversight for Nigerian retailers, wholesalers, distributors, and service businesses.', path: '/solutions' });

export default function SolutionsPage() {
  return <PublicGuidePage kicker="Solutions" title="Financial oversight for the way your business actually runs" description="Dorah helps small businesses connect daily transactions with cash, customer balances, supplier bills, and the next thing worth reviewing." sections={[
    { title: 'Retail and shops', body: 'Keep sales, expenses, cash balances, and supplier obligations together when money moves quickly every day.', points: ['See recorded cash and expenses', 'Keep supplier bills in view', 'Review unusual entries before they become habits'] },
    { title: 'Wholesalers and distributors', body: 'Understand what is tied up in customer credit, what suppliers are owed, and which collections may affect your next purchase.', points: ['Track customer balances and due dates', 'Record partial payments', 'Compare expected collections with upcoming bills'] },
    { title: 'Service businesses', body: 'Build a clearer picture when income arrives by project, customers pay in stages, and operating costs are spread across the month.', points: ['Connect income to customers or work', 'Keep recurring costs visible', 'Review the evidence behind changes'] },
    { title: 'Owner-managed businesses', body: 'Start with the records you have and create a simple weekly habit for staying close to your business money.', points: ['Record transactions without an accounting department', 'See what needs attention first', 'Work alongside your accountant'] },
    { title: 'Businesses growing beyond spreadsheets', body: 'Move from scattered files and chat messages to one workspace when balances, obligations, and transaction history become harder to reconcile.', points: ['Keep one view of financial activity', 'Reduce repeated manual checking', 'Build a record you can explain'] },
  ]} related={[{ label: 'See all features', href: '/features' }, { label: 'Read practical guides', href: '/resources' }, { label: 'View pricing', href: '/pricing' }]} cta="See how Dorah works" ctaHref="/how-it-works" />;
}
