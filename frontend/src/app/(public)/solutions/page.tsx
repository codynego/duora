import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Financial Control for Small Businesses', description: 'See how Dorah helps retailers, wholesalers, creative businesses, service teams, and owner-managed businesses stay close to their money.', path: '/solutions' });

export default function SolutionsPage() {
  return <PublicGuidePage kicker="Solutions" title="Built around the money questions owners face every day" description="Different businesses sell differently, but the hard questions are familiar: what came in, what went out, who still owes, what is due, and what changed?" sections={[
    { title: 'Retailers and everyday sellers', body: 'Keep fast-moving sales, expenses, cash, bank, and POS activity in view without turning every evening into a reconciliation exercise.', points: ['See today’s movement by account', 'Review daily sales and expenses', 'Find the records behind a total'] },
    { title: 'Wholesalers and distributors', body: 'Separate sales from collections and understand how much customer credit is still tied up before you place the next order.', points: ['Track due and overdue customer balances', 'Record part-payment correctly', 'Compare expected collections with supplier bills'] },
    { title: 'Studios and creative businesses', body: 'Connect project income to a customer, keep staged payments visible, and understand which services or items contribute most to recorded sales.', points: ['Record deposits and final balances', 'Ask which items sell more', 'Review income over custom dates'] },
    { title: 'Service businesses', body: 'Follow income that arrives by job while keeping fuel, subscriptions, wages, supplies, and other operating costs in context.', points: ['See profitability for a selected period', 'Compare expense categories over time', 'Know which clients still have a balance'] },
    { title: 'Owners moving beyond notebooks', body: 'Build one explainable record instead of searching through notebooks, screenshots, messages, and separate spreadsheets whenever a question comes up.', points: ['Start from today without a long setup', 'Create a repeatable recording habit', 'Give your accountant cleaner source records'] },
    { title: 'Small teams that need shared clarity', body: 'Use a consistent transaction history and evidence trail so financial conversations begin with the same recorded facts.', points: ['Keep descriptions and categories clear', 'Review possible issues without accusations', 'Make the owner’s final decision explicit'] },
  ]} related={[{ label: 'Explore all features', href: '/features' }, { label: 'Meet the financial controller', href: '/financial-controller' }, { label: 'View pricing', href: '/pricing' }]} cta="See Dorah in action" ctaHref="/product-tour" />;
}
