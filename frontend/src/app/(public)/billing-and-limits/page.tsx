import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Plan Limits and Billing FAQ', description: 'Understand Dorah transaction, contact, and AI usage limits and what happens when a business reaches its plan allowance.', path: '/billing-and-limits' });

export default function BillingAndLimitsPage() {
  return <PublicGuidePage kicker="Plans and usage" title="Know what your plan includes before a limit gets in the way" description="Dorah applies limits to new activity by billing period or account capacity. Existing records remain part of the business workspace when a new action is blocked." sections={[
    { title: 'Free', body: 'Designed for getting started: up to 100 transactions per month, 5 AI uses per month, 20 customers, and 10 suppliers.' },
    { title: 'Control', body: 'Designed for consistent record keeping: unlimited transactions, 50 AI uses per month, 20 customers, and 10 suppliers.' },
    { title: 'Intelligence', body: 'Designed for deeper financial exploration: unlimited transactions, 200 AI uses per month, 20 customers, and 10 suppliers.' },
    { title: 'Business', body: 'Designed for businesses that need unlimited transactions, AI use, customers, and suppliers. Availability and commercial terms may be handled directly with Dorah.' },
    { title: 'What counts as AI use', body: 'Using supported AI features—such as parsing a text transaction or sending a Financial Intelligence chat request—can count toward the monthly AI allowance.' },
    { title: 'What happens at a limit', body: 'Dorah blocks the limited new action and shows an upgrade prompt. It should not silently create a partial record or remove existing records.' },
    { title: 'When monthly limits reset', body: 'Monthly transaction and AI allowances follow the active billing or usage period shown for the account. Contact support if the displayed allowance does not match the plan.' },
    { title: 'Before changing plans', body: 'Compare the current pricing page and in-product plan information. For billing, cancellation, or plan-access questions, email support@dorah.me from the account email.' },
  ]} related={[{ label: 'Compare current pricing', href: '/pricing' }, { label: 'Contact support', href: '/contact' }, { label: 'See AI transparency', href: '/ai-transparency' }]} cta="Compare Dorah plans" ctaHref="/pricing" />;
}
