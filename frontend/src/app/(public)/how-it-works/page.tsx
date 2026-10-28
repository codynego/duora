import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'How Dorah Works', description: 'Start with today’s business activity, connect it to the right customer or account, and build a clearer financial picture as you go.', path: '/how-it-works' });

export default function HowItWorksPage() {
  return <PublicGuidePage kicker="How Dorah works" title="Start with today. The picture gets clearer from there" description="You do not need perfect books, a finance department, or a long setup process. Dorah becomes more useful as you record the real activity of the business." sections={[
    { title: 'Set up the view you need', body: 'Add the name of your business, choose the main currency, and create the cash and bank accounts you actually use. Keep it simple—the point is to create a place where the next record can make sense.', points: ['Use clear account names you will recognise', 'Add an opening balance only when you know it', 'Start with the information you have today'] },
    { title: 'Record what happened', body: 'Save a sale, an expense, a customer payment, or a transfer. Use the normal form when you want control over every detail, or describe the event in your own words and review the draft.', points: ['Enter the amount that moved now', 'Keep the customer or supplier connected where it matters', 'Confirm text-generated details before saving'] },
    { title: 'Let the records stay connected', body: 'The same transaction can affect an account, a customer balance, a supplier bill, and a performance view. Recording it once, properly, gives you a more reliable answer everywhere else.', points: ['Keep expected customer money separate from cash received', 'Record a repayment against the balance it settles', 'Use a transfer for money moved between your own accounts'] },
    { title: 'Review the business, then decide', body: 'Use the overview for the big picture, performance for change over time, and Financial Intelligence when you need help finding what deserves attention. Every useful answer should lead you back to the records behind it.', points: ['Review findings before reacting to them', 'Ask questions with the date or period in mind', 'Make the final decision with the evidence open'] },
  ]} related={[{ label: 'Follow the product tour', href: '/product-tour' }, { label: 'Try text-to-transaction', href: '/text-to-transaction' }, { label: 'Open the how-to guides', href: '/help' }]} numberSections />;
}
