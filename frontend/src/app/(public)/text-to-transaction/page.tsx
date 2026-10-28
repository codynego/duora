import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Text to Transaction', description: 'Describe a business sale, expense, repayment, supplier payment, or transfer in everyday language, then review the record before saving.', path: '/text-to-transaction' });

export default function TextToTransactionPage() {
  return <PublicGuidePage kicker="Text to transaction" title="Say it the way it happened" description="You should not have to translate a simple business event into a long form before you can record it. Tell Dorah what happened, then check the record together." sections={[
    { title: 'Describe one real event', body: 'Write it as you would explain it to someone helping with the books: “I sold 10 bags of rice to Emeka for ₦180,000. He paid ₦100,000 cash and will pay the rest next week.” The clearer the story, the better the draft.', points: ['Say what was sold, bought, paid, or moved', 'Mention who was involved where it matters', 'Include what changed hands now—not only the total'] },
    { title: 'See the record take shape', body: 'Dorah can turn your description into a transaction type, amount, contact, account, payment method, outstanding balance, and due date. It is a shortcut into the normal record, not a replacement for it.' },
    { title: 'Leave uncertainty in the open', body: 'If it cannot tell which customer you meant, where the money went, or when a balance is due, Dorah should ask or leave that field for you to confirm. It should never fill a financial gap with guesswork.' },
    { title: 'Edit when the detail matters', body: 'Open the draft in the transaction form when you want to change anything. When every field is right, quick save is there to keep the process fast. In either case, you make the final confirmation.' },
    { title: 'Keep the bookkeeping honest', body: 'A customer paying an old balance is not a new sale. Moving money from bank to cash is not income. Dorah uses the normal transaction rules when saving so the rest of your records stay consistent.', points: ['Repayments reduce an existing balance', 'Transfers only change where money sits', 'Only the money received now increases the receiving account'] },
    { title: 'Keep it simple on purpose', body: 'Text-to-transaction is designed for one event at a time. It is not for unattended posting, bulk uploads, voice recording, or receipt scanning—and that is how the review step stays meaningful.' },
  ]} related={[{ label: 'See how Dorah works', href: '/how-it-works' }, { label: 'Read AI transparency', href: '/ai-transparency' }, { label: 'Open the transaction guide', href: '/help/record-a-transaction' }]} cta="Try text-to-transaction" ctaHref="/dashboard" />;
}
