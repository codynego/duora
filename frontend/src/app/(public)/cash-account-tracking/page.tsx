import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Cash and Account Tracking', description: 'See what each cash, bank, POS, or business account received and paid in a chosen period, and understand its current recorded balance.', path: '/cash-account-tracking' });

export default function CashAccountTrackingPage() {
  return <PublicGuidePage kicker="Cash and accounts" title="Your business money does not all live in one place" description="Dorah helps you see what moved through cash, bank, POS, and other accounts—without losing the wider view of the business." sections={[
    { title: 'Name the places money actually sits', body: 'Start with the accounts your business really uses: cash on hand, a business bank account, POS, or another practical place. Clear names make it easier to know where a transaction belongs.' },
    { title: 'Look at the period you care about', body: 'Choose Today when you are closing the day, Yesterday when you are checking what happened, or a longer and custom range when you are trying to understand a pattern. Each account shows what came in and what went out in that time.' },
    { title: 'Use all time for the balance you have now', body: 'All time answers a different question. It shows the current recorded position of the account: its opening balance plus every saved movement that affects it.' },
    { title: 'Move money without changing the story', body: 'If you move ₦100,000 from bank to cash, the business has not made ₦100,000 and it has not spent ₦100,000. A transfer simply changes where the same money is held.' },
    { title: 'Investigate a difference before you worry', body: 'If the cash in the drawer or the bank statement does not match Dorah, check the date range, opening balance, missing record, duplicate record, and the account used on each transaction. The answer is usually in one of those places.' },
  ]} related={[{ label: 'Track customer balances', href: '/customer-debt-tracking' }, { label: 'Explore the features', href: '/features' }, { label: 'Read the how-to guides', href: '/help' }]} />;
}
