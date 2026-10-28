import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Data and Account Management', description: 'Learn how to correct business records, protect account access, and request help with account, privacy, export, or deletion needs.', path: '/data-and-account-management' });

export default function DataAndAccountManagementPage() {
  return <PublicGuidePage kicker="Your account and data" title="Keep the record accurate—and know where to go when you need a change" description="Most financial corrections begin with the source transaction. Account-level privacy, export, or deletion needs can be handled with support when a self-service control is not available." sections={[
    { title: 'Correct the source record', body: 'When a total or answer looks wrong, open the transaction, customer balance, supplier bill, or account that created it. Correcting the source keeps connected views consistent.' },
    { title: 'Protect account access', body: 'Use a strong, unique password, reset it if access is uncertain, and sign out on devices you do not control. Contact support promptly about unfamiliar access.' },
    { title: 'Ask for privacy help', body: 'Email support@dorah.me with the subject “Privacy request” and the email used for the Dorah account. Explain whether you need access, correction, export guidance, or deletion support.' },
    { title: 'Account and data deletion', body: 'Where deletion is not available as a self-service action, request it through support. Dorah may need to verify that the requester controls the account before acting.' },
    { title: 'Do not send secrets for verification', body: 'Support should not need your password, one-time code, online-banking credentials, or full payment-card number. Never include them in a request.' },
    { title: 'Understand the consequence', body: 'Deleting an account or business data can remove the records used for balances, reports, and intelligence. Ask what can be recovered before confirming an irreversible request.' },
  ]} related={[{ label: 'Read the privacy policy', href: '/privacy' }, { label: 'Review security and data', href: '/security' }, { label: 'Contact Dorah', href: '/contact' }]} cta="Contact support" ctaHref="/contact" />;
}
