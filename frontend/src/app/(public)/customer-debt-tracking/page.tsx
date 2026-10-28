import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Customer Debt Tracking', description: 'Track credit sales, partial payments, due dates, overdue balances, and customer repayment history without counting collections as new sales.', path: '/customer-debt-tracking' });

export default function CustomerDebtTrackingPage() {
  return <PublicGuidePage kicker="Customer balances" title="Know who owes you, how much is left, and what happened along the way" description="A sale is not the same as cash received. Dorah keeps the value of the sale, the payment collected, and the balance still owed in the right places." sections={[
    { title: 'Record the credit correctly', body: 'Save the full sale value, the amount received now, the customer, and the due date. The unpaid portion becomes the customer balance.' },
    { title: 'Handle partial payments', body: 'When the customer pays later, record a repayment against the existing balance. The account increases, but sales are not counted again.' },
    { title: 'See due and overdue balances', body: 'Filter and review customer balances so follow-up begins with the right people, amounts, and dates—not memory.' },
    { title: 'Open the history', body: 'Use the customer’s records to understand the original sale, payments received, remaining balance, and descriptions that explain the activity.' },
    { title: 'Ask direct questions', body: 'Financial Intelligence can help answer “Which customers owe me the most?”, “Who paid ₦25,000 recently?”, or “What became overdue this week?” when the relevant data is recorded.' },
    { title: 'Treat the balance as recorded evidence', body: 'A Dorah balance reflects the transactions entered. Confirm missing offline payments, corrections, and disputed amounts before following up.' },
  ]} related={[{ label: 'Track cash and accounts', href: '/cash-account-tracking' }, { label: 'Explore Financial Intelligence', href: '/financial-intelligence' }, { label: 'See pricing', href: '/pricing' }]} />;
}
