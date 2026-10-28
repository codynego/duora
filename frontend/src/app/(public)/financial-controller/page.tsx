import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Financial Controller for Small Business', description: 'See how Dorah turns daily business records into cash visibility, debt tracking, financial findings, and practical next actions.', path: '/financial-controller' });

export default function FinancialControllerPage() {
  return <PublicGuidePage kicker="Your financial controller" title="Stay close to the money without becoming your own finance department" description="Dorah gives an owner a disciplined way to record activity, understand the position of the business, investigate changes, and decide what to do next." sections={[
    { title: 'A controller starts with the record', body: 'Useful oversight depends on what was actually saved: the amount, date, account, transaction type, customer or supplier, and any balance still due.', points: ['Trace summaries to transactions', 'Keep repayments separate from new income', 'Keep transfers separate from sales and expenses'] },
    { title: 'It keeps obligations visible', body: 'Customer balances and supplier bills stay connected to due dates and payments, so an unpaid amount does not disappear inside a monthly total.', points: ['Know who owes your business', 'See which balances are overdue', 'Plan for upcoming supplier payments'] },
    { title: 'It explains what changed', body: 'Performance views and Financial Intelligence help compare periods, categories, items, customers, and days—using the records relevant to the question.', points: ['Switch between daily, weekly, and monthly views', 'Ask date-specific questions', 'Use charts when comparison helps'] },
    { title: 'It points to action, not panic', body: 'A finding should say what needs attention, why it matters, what evidence supports it, and what the owner can review next.', points: ['Possible issues remain clearly uncertain', 'Exposure is not presented as confirmed loss', 'The owner keeps final control'] },
    { title: 'It works alongside professionals', body: 'Dorah can make source records easier to follow and questions easier to frame, but it does not replace an accountant, auditor, tax adviser, or regulated financial adviser.' },
  ]} related={[{ label: 'Explore Financial Intelligence', href: '/financial-intelligence' }, { label: 'See all features', href: '/features' }, { label: 'Take the product tour', href: '/product-tour' }]} />;
}
