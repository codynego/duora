import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Cash and Account Tracking', description: 'See money received and paid through each business account for a chosen date range, and review current recorded balances across all time.', path: '/cash-account-tracking' });

export default function CashAccountTrackingPage() {
  return <PublicGuidePage kicker="Cash and accounts" title="See where money moved—not only the business-wide total" description="Cash on hand, bank, POS, and other accounts can tell different stories. Dorah keeps their activity separate while preserving one business view." sections={[
    { title: 'Create the accounts you use', body: 'Add the practical places where business money sits or moves. Use clear names so a transaction can be assigned without guesswork.' },
    { title: 'Choose the period', body: 'Use Today, Yesterday, Last 7 days, Last 30 days, All time, or a custom range. Each account shows what it received and paid during that selected period.' },
    { title: 'Understand all time', body: 'When All time is selected, the account view represents the current recorded balance: opening balance plus all saved movements affecting that account.' },
    { title: 'Record transfers correctly', body: 'Moving ₦100,000 from bank to cash reduces one account and increases the other. It should not inflate business income or expenses.' },
    { title: 'Investigate differences', body: 'If physical cash or a bank statement differs from Dorah, check the date range, opening balance, missing entries, duplicated entries, and the account chosen on each transaction.' },
  ]} related={[{ label: 'Learn customer debt tracking', href: '/customer-debt-tracking' }, { label: 'Take the product tour', href: '/product-tour' }, { label: 'Get how-to help', href: '/help' }]} />;
}
