import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Security and Data Handling',
  description: 'Learn how Dorah protects access to business workspaces, handles financial records, and what information you should not send to support.',
  path: '/security',
});

export default function SecurityPage() {
  return <PublicGuidePage kicker="Security and data" title="Financial records deserve careful boundaries" description="Dorah combines account controls, protected production connections, business-level authorization, and review-before-save workflows to reduce avoidable risk." sections={[
    { title: 'Access follows the signed-in user', body: 'The finance workspace requires authentication. API requests verify that the user is allowed to access the selected business instead of trusting a business identifier on its own.' },
    { title: 'Production traffic is protected', body: 'Dorah’s production configuration is designed for HTTPS-only access, secure authentication cookies, and browser security headers. The protection in practice also depends on correct deployment and device security.' },
    { title: 'AI does not get final authority', body: 'Text-to-transaction creates a draft for review. Financial chat may help explain recorded data, but backend rules remain responsible for validated records and calculated totals.', points: ['Review generated fields before saving', 'Treat findings as prompts to investigate', 'Do not rely on AI as professional financial advice'] },
    { title: 'Share only what the product needs', body: 'Do not enter online-banking passwords, full payment-card numbers, authentication codes, government identity documents, or unrelated sensitive personal information.' },
    { title: 'Protect your side of the account', body: 'Use a strong, unique password, keep your device updated, sign out on shared devices, and contact support promptly if access does not look familiar.' },
    { title: 'Report concerns responsibly', body: 'Email support@dorah.me with the affected page, approximate time, and a safe description. Do not access another user’s records or include secrets in the report.' },
  ]} related={[{ label: 'See how AI is used', href: '/ai-transparency' }, { label: 'Read the privacy policy', href: '/privacy' }, { label: 'Manage your data', href: '/data-and-account-management' }]} cta="Understand AI and your records" ctaHref="/ai-transparency" />;
}
