import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Small Business Finance Features',
  description: 'See how Dorah helps small businesses record transactions, track cash and outstanding balances, review financial performance, and investigate possible issues.',
  path: '/features',
});

export default function FeaturesPage() {
  return <PublicGuidePage kicker="Dorah features" title="The important money details, in one place" description="Dorah gives small businesses a focused way to record everyday activity and review the balances and changes that affect their financial picture." sections={[
    { title: 'Record money in and out', body: 'Keep sales, customer payments, expenses, supplier payments, and account transfers in a transaction history. Transfers between accounts are shown separately from income and expenses.', points: ['Categorize and search recorded activity', 'Link payments to outstanding balances', 'Review the evidence behind reported totals'] },
    { title: 'Track receivables and payables', body: 'Record customer invoices and supplier bills, then follow their remaining balances and due dates. Partial payments update the balance still outstanding.', points: ['See overdue customer balances', 'Review supplier bills coming due', 'Keep a transaction history for each contact'] },
    { title: 'Understand cash and performance', body: 'Review account balances alongside recorded income, expenses, and net performance. Reports reflect the records entered for the business and should be checked for completeness.', points: ['Cash and account overview', 'Monthly income and expense summaries', 'Financial performance by period'] },
    { title: 'Investigate supported findings', body: 'Dorah checks saved records for supported patterns such as overdue balances, upcoming supplier obligations, higher spending in a category, or possible duplicate entries. Findings include evidence and a suggested review action.', points: ['Possible duplicates are not treated as confirmed errors', 'AI-generated financial answers are not currently available'] },
    { title: 'Choose a primary currency', body: 'Set the main currency used to present your business overview during onboarding. This currency represents your primary financial view; full multi-currency accounting is not currently offered.' },
  ]} related={[{ label: 'Learn how Dorah works', href: '/how-it-works' }, { label: 'Compare plans', href: '/pricing' }, { label: 'Get help', href: '/help' }]} />;
}
