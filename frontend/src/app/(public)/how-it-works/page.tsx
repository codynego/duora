import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'How It Works',
  description: 'Get started with Dorah in a few steps: set up your business, record the financial activity you have, and review evidence-backed findings.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return <PublicGuidePage kicker="How Dorah works" title="Turn everyday money activity into a business picture you can use" description="You do not need perfect books to begin. Start with today, keep recording consistently, and let Dorah turn those records into balances, performance, findings, and answers." sections={[
    { title: 'Create the business view', body: 'Add your business name, country, and primary currency, then create the cash and bank accounts you actually use.', points: ['Start with only the accounts you need', 'Enter an opening balance where appropriate', 'Use one primary currency for the main financial view'] },
    { title: 'Record what happened', body: 'Enter a transaction manually or describe it in a sentence. For example: “I sold 10 bags of rice to Emeka for ₦180,000. He paid ₦100,000 cash.”', points: ['Review every text-generated draft before saving', 'Record only ₦100,000 as received now', 'Keep the remaining ₦80,000 against the customer'] },
    { title: 'Keep balances connected', body: 'Link the transaction to the right customer, supplier, category, and account. When a payment arrives later, record it as a repayment—not as a second sale.', points: ['See who owes you and for how long', 'Track supplier bills and partial payments', 'Keep transfers separate from business income'] },
    { title: 'Review, ask, and act', body: 'Use the overview and performance pages for totals, review Financial Intelligence for supported findings, or ask a direct question about the records.', points: ['Open the evidence behind a finding', 'Use date-specific questions when timing matters', 'Confirm context before changing a record or making a payment decision'] },
  ]} related={[{ label: 'Take the product tour', href: '/product-tour' }, { label: 'Learn text-to-transaction', href: '/text-to-transaction' }, { label: 'Open the how-to guides', href: '/help' }]} numberSections />;
}
