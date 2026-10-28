import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'About',
  description: 'Dorah helps small-business owners understand where their money went, what they are owed, what is due, and what needs attention next.',
  path: '/about',
});

export default function AboutPage() {
  return <PublicGuidePage kicker="Why Dorah exists" title="Know where your business stands—without piecing it together yourself" description="You should not have to search through receipts, messages, notebooks, and your memory just to understand your own business. Dorah brings your financial records together, explains what they mean, and helps you see what needs your attention next." sections={[
    { title: 'Running a business is hard enough without guessing about the money', body: 'A business can be busy, making sales, serving customers, and still leave its owner wondering: Did we actually make money? Who still owes us? Can we afford the bills coming up? Dorah is built to help you answer those questions with the records you already have—and build a clearer picture as you go.', points: ['See what came in and what went out', 'Keep unpaid customer balances and supplier bills in view', 'Understand your cash position and recorded performance'] },
    { title: 'Built for business owners, not accounting experts', body: 'You do not need perfect books before you begin. Start with today. Add a sale, an expense, or the balance a customer still owes. Enter it manually or describe what happened in ordinary language. Dorah handles the structure so you can focus on running the business.', points: ['Get started without a complicated setup', 'Keep customers, suppliers, accounts, and transactions connected', 'Ask practical questions in the language you naturally use'] },
    { title: 'More than numbers on a dashboard', body: 'A total tells you what happened. A useful financial controller helps you understand why it matters. Dorah looks across your recorded activity to highlight overdue balances, upcoming commitments, unusual changes, and possible mistakes worth checking—then points you back to the evidence.', points: ['See the records behind every finding', 'Separate possible issues from confirmed facts', 'Know the next sensible action to consider'] },
    { title: 'Clarity that grows with every record', body: 'Financial confidence rarely arrives all at once. It grows when you record what happened, review what is still open, and make the next decision with better information. Dorah turns those small habits into a clearer view of your business—so fewer things catch you by surprise.', points: ['Spend less time searching for answers', 'Follow up on money before it becomes forgotten', 'Make decisions with a stronger sense of where you stand'] },
    { title: 'Your records. Your judgement. Your business.', body: 'Dorah can organize information, calculate totals, explain patterns, and surface things worth reviewing. It cannot know what was never recorded, and it does not replace an accountant or professional tax, legal, or financial advice. You remain in control of every record and every decision.' },
  ]} related={[{ label: 'Explore product features', href: '/features' }, { label: 'See how it works', href: '/how-it-works' }, { label: 'Compare plans', href: '/pricing' }]} />;
}
