import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Customer Debt Tracking', description: 'Keep credit sales, part-payments, due dates, overdue balances, and repayment history clear without treating collections as new income.', path: '/customer-debt-tracking' });

export default function CustomerDebtTrackingPage() {
  return <PublicGuidePage kicker="Customer balances" title="Credit sales should not become forgotten money" description="Dorah helps you remember the full sale, the amount the customer paid, and the amount still outstanding—without mixing any of them up." sections={[
    { title: 'Capture the whole agreement', body: 'When you sell on credit, record what the customer bought, the full amount, what they paid today, and when the rest is expected. The unpaid part stays visible as a balance instead of being left to memory.' },
    { title: 'Let part-payments do their real job', body: 'When a customer sends money later, record it against what they already owe. Your account balance increases, the customer balance falls, and your sales total does not get counted again.' },
    { title: 'Follow up with facts, not guesswork', body: 'A useful follow-up starts with the customer, the amount, what it was for, and the date you agreed. Dorah gives you that context before you pick up the phone or send a message.' },
    { title: 'See the story behind the balance', body: 'Open the customer history when you need to understand how a balance started, what has been paid, what remains, and whether a note or transaction needs correcting.' },
    { title: 'Ask when you need a quick answer', body: 'Ask who owes the most, who paid ₦25,000 recently, or which balances became overdue this week. The answer is useful because it stays connected to the records you entered.' },
    { title: 'Keep recorded balances honest', body: 'Dorah can only reflect what is saved. Before following up, check for an offline payment, a disputed amount, or an entry that needs correcting. A clear balance is evidence—not a substitute for context.' },
  ]} related={[{ label: 'Track cash and accounts', href: '/cash-account-tracking' }, { label: 'Explore Financial Intelligence', href: '/financial-intelligence' }, { label: 'See plans', href: '/pricing' }]} />;
}
