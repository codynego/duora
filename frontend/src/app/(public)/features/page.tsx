import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Small Business Finance Features',
  description: 'See how Dorah helps small businesses record transactions, track cash and outstanding balances, review financial performance, and investigate possible issues.',
  path: '/features',
});

export default function FeaturesPage() {
  return <PublicGuidePage kicker="Dorah features" title="Less chasing numbers. More knowing what they mean" description="Dorah brings daily transactions, customer debts, supplier bills, account balances, performance, and financial questions into one focused workspace." sections={[
    { title: 'Record a transaction your way', body: 'Use the normal form when you want precise control, or describe what happened in everyday language and review the structured draft before saving.', points: ['Record money received, money paid, and transfers', 'Keep partial payments separate from the balance still owed', 'Nothing is posted from text until you confirm it'] },
    { title: 'Know who owes what', body: 'Connect transactions to customers and suppliers so an unpaid balance does not disappear inside a general sales total.', points: ['See customer balances and due dates', 'Record repayments without counting them as new sales', 'Review supplier obligations before cash is needed'] },
    { title: 'See cash by account and period', body: 'Understand how much moved through cash, bank, or another account today, yesterday, or across a chosen period—and see the current recorded balance when viewing all time.', points: ['Filter by common or custom dates', 'Keep transfers out of income and expense totals', 'Trace totals back to saved records'] },
    { title: 'Measure performance in context', body: 'Compare recorded sales and expenses over a selected period, then switch the chart between daily, weekly, and monthly intervals when the question changes.', points: ['See profitability from recorded activity', 'Compare money received with money paid', 'Use date ranges that match the decision you are making'] },
    { title: 'Ask your financial controller', body: 'Ask questions such as who owes you, who recently paid a specific amount, which items sell most, or which days are busiest. Dorah uses relevant saved records and can present a chart when a comparison is clearer visually.', points: ['Answers are grounded in the records available', 'Computed totals stay under backend financial rules', 'Incomplete data and uncertainty should be made clear'] },
    { title: 'Review findings before they grow', body: 'Dorah can surface overdue balances, upcoming supplier obligations, spending changes, or possible duplicate entries, then show the evidence and a practical next action.', points: ['A possible issue is not presented as a confirmed loss', 'You decide whether a record should change', 'Dorah supports—not replaces—professional advice'] },
  ]} related={[{ label: 'See the product tour', href: '/product-tour' }, { label: 'Learn about Financial Intelligence', href: '/financial-intelligence' }, { label: 'Compare plans', href: '/pricing' }]} />;
}
