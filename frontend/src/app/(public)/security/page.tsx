import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Security and Data Handling',
  description: 'Learn how Dorah protects access to business workspaces, handles financial records, and what information you should not send to support.',
  path: '/security',
});

export default function SecurityPage() {
  return <PublicGuidePage kicker="Security and data" title="Your business records should stay yours" description="Financial data deserves careful handling. Dorah’s account and API controls are designed to limit workspace access to authenticated users and the businesses they are authorized to manage." sections={[
    { title: 'Authenticated access', body: 'Dorah requires an authenticated account to access the finance workspace. Financial API requests also check that the signed-in user is authorized for the selected business.' },
    { title: 'Protected connections', body: 'The production configuration supports HTTPS-only access, secure authentication cookies, and browser security headers. These settings depend on production deployment configuration.' },
    { title: 'Use only business information you need', body: 'Add records that help you manage your business. Do not enter account passwords, online banking credentials, full payment-card numbers, or unrelated sensitive information.' },
    { title: 'Get help with a data concern', body: 'For a privacy or security question, contact support@dorah.me. Describe the issue without sending passwords, full card details, or authentication codes.' },
  ]} related={[{ label: 'Read the privacy policy', href: '/privacy' }, { label: 'Contact Dorah', href: '/contact' }, { label: 'Get product help', href: '/help' }]} cta="Review privacy details" ctaHref="/privacy" />;
}
