import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Text to Transaction', description: 'Describe a sale, expense, repayment, supplier payment, or transfer in ordinary language and review the structured draft before saving.', path: '/text-to-transaction' });

export default function TextToTransactionPage() {
  return <PublicGuidePage kicker="Text to transaction" title="Describe what happened. Review the record. Save with confidence" description="Text-to-transaction is a faster route into Dorah’s normal transaction workflow—not a chatbot that quietly changes your books." sections={[
    { title: 'Write one clear business event', body: 'For example: “I sold 10 bags of rice to Emeka for ₦180,000. He paid ₦100,000 cash and will pay the balance next week.”', points: ['Include the amount and who was involved', 'Mention how much moved now', 'Add the account or payment method if known'] },
    { title: 'Dorah prepares a draft', body: 'The description, transaction type, total, amount paid, contact, account, payment method, outstanding balance, and due date can be extracted into structured fields.' },
    { title: 'Missing detail stays visible', body: 'If the exact due date, customer match, account, or purpose is unclear, the draft should ask for that detail instead of inventing it.' },
    { title: 'You edit or quick-save', body: 'Open the draft in the normal form when you want to adjust fields, or use quick save when the draft is complete and correct. Confirmation is always required.' },
    { title: 'Financial rules stay on the backend', body: 'AI helps interpret language; Dorah’s normal transaction service validates and saves the record so balances and reports update consistently.', points: ['A debt repayment is not new income', 'A transfer is not income or expense', 'Only money received now increases the receiving account'] },
    { title: 'Keep the first version simple', body: 'Enter one transaction at a time. Voice, receipt scanning, bulk entry, and unattended posting are not part of this workflow.' },
  ]} related={[{ label: 'How Dorah works', href: '/how-it-works' }, { label: 'Read AI transparency', href: '/ai-transparency' }, { label: 'Record a transaction guide', href: '/help' }]} cta="Try text-to-transaction" ctaHref="/dashboard" />;
}
