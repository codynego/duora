import PublicInfoPage from '@/components/PublicInfoPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({ title: 'Privacy Policy', description: 'Read how Dorah handles account details and business financial records, what information to avoid sharing, and how to contact the team with a privacy request.', path: '/privacy' });

export default function PrivacyPage() {
  return <PublicInfoPage kicker="Privacy at Dorah" title="Understand the information behind your financial view." description="Dorah needs account and business records to provide the service. This page explains the practical boundaries in plain language; the Terms of Service provide the wider contractual terms." sections={[
    { title: 'Information you provide', body: 'This can include account details, business profile information, transactions, account balances, customer and supplier names, due dates, descriptions, and other records you choose to add.' },
    { title: 'How the information is used', body: 'Dorah uses recorded information to operate the workspace, calculate financial views, answer supported questions, surface findings, provide support, enforce plan limits, and maintain the service.' },
    { title: 'AI-assisted features', body: 'When you use text-to-transaction or Financial Intelligence chat, relevant text and business context may be processed to produce a draft or answer. Review generated output and avoid adding secrets the feature does not need.' },
    { title: 'Your choices and accuracy', body: 'You decide what business records to enter. You can correct records in the product where editing is available and can contact support for privacy, account, or deletion requests.' },
    { title: 'Information you should not add', body: 'Do not enter passwords, one-time codes, online-banking credentials, full payment-card numbers, or sensitive information unrelated to managing the business.' },
    { title: 'Keeping access secure', body: 'Use a strong, unique password and protect the device where you use Dorah. Contact support promptly if you believe your account has been accessed without permission.' },
    { title: 'Requests and questions', body: 'Email support@dorah.me with the subject “Privacy request” for access, correction, export guidance, or account and data deletion support. Never include your password.' },
    { title: 'Policy changes', body: 'Dorah may update this notice as the product and its data practices evolve. Material changes should be reflected on this page with clear, current wording.' },
  ]} />;
}
