import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Dorah Product Tour', description: 'Follow one everyday sale from a simple description to a saved record, account activity, customer balance, performance view, and a useful next action.', path: '/product-tour' });

export default function ProductTourPage() {
  return <PublicGuidePage kicker="A day with Dorah" title="Watch one sale become a clearer business decision" description="A single record can do more than sit in a transaction list. Here is how one part-payment sale travels through Dorah and keeps the rest of the picture honest." sections={[
    { title: 'Say what happened', body: 'Ada ordered printing worth ₦90,000. She paid ₦50,000 into the business bank and says she will send the rest on Friday. That is how most owners would describe it—and it is enough to begin.' },
    { title: 'Check the draft before it becomes a record', body: 'Dorah prepares a ₦90,000 sale, ₦50,000 received, Ada as the customer, the business bank as the account, and ₦40,000 still owed. You check the details and confirm the due date.' },
    { title: 'Save one version of the truth', body: 'When you save, the normal transaction service validates the entry. The bank activity goes up by ₦50,000. Ada’s outstanding balance becomes ₦40,000. The same event is not recorded twice in different places.' },
    { title: 'See the effect where it belongs', body: 'The transaction list shows the sale. Cash and Accounts shows the money that reached the bank. Customer Balances shows what Ada still owes. Performance includes the recorded sale for the period you are reviewing.' },
    { title: 'Ask the next question', body: 'Later, you can ask who still owes you money this week. Dorah uses the right period and the matching customer records, rather than offering a generic answer that sounds helpful but cannot be checked.' },
    { title: 'Follow up with the context open', body: 'If Friday passes without the balance arriving, Dorah can surface the overdue amount with the date and record behind it. You still decide how to follow up—but you no longer have to search for the details first.' },
  ]} related={[{ label: 'Explore all features', href: '/features' }, { label: 'See how Dorah works', href: '/how-it-works' }, { label: 'Compare plans', href: '/pricing' }]} cta="Start with your business" ctaHref="/signup" numberSections />;
}
