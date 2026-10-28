import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Dorah Product Tour', description: 'Take a practical tour from recording a transaction to reviewing cash, balances, performance, findings, and financial questions.', path: '/product-tour' });

export default function ProductTourPage() {
  return <PublicGuidePage kicker="Product tour" title="Follow one transaction through the whole financial picture" description="This illustrative tour shows how a business event moves from a sentence into a reviewed record, then into account activity, customer balances, performance, and Financial Intelligence." sections={[
    { title: 'Describe the sale', body: '“I sold printing worth ₦90,000 to Ada. She paid ₦50,000 into the business bank and will pay the balance on Friday.”' },
    { title: 'Review the draft', body: 'Dorah proposes a ₦90,000 sale, ₦50,000 received, Ada as the customer, the business bank as the account, and ₦40,000 outstanding. You confirm the exact due date.' },
    { title: 'Save one consistent record', body: 'The normal transaction service validates the entry. The bank activity increases by ₦50,000 and Ada’s customer balance becomes ₦40,000.' },
    { title: 'See the wider effect', body: 'Transactions show the saved event, Cash and Accounts show the money received by bank, Customer Balances show what Ada still owes, and Performance includes the recorded sale in the selected period.' },
    { title: 'Ask a useful question', body: 'You can ask “Which customers owe me money this week?” Dorah resolves the period, uses the relevant balances and records, and returns an answer grounded in what is saved.' },
    { title: 'Act with the evidence open', body: 'If the balance becomes overdue, a finding can explain the amount and due date and direct you to the customer records before you follow up.' },
  ]} related={[{ label: 'Explore all features', href: '/features' }, { label: 'Learn how Dorah works', href: '/how-it-works' }, { label: 'See pricing', href: '/pricing' }]} cta="Start with your business" ctaHref="/signup" numberSections />;
}
