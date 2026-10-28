import PublicInfoPage from '@/components/PublicInfoPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({ title: 'Contact Support', description: 'Contact the Dorah team for help with account access, financial records, product questions, or feedback.', path: '/contact' });

export default function ContactPage() {
  return <PublicInfoPage kicker="Talk to Dorah" title="A real question deserves a useful answer." description="Whether you are stuck, comparing plans, reporting a problem, or sharing an idea, email support@dorah.me and give us enough context to help." sections={[
    { title: 'Product and account help', body: 'Tell us the page you were using, what you expected to happen, and what happened instead. A screenshot can help, but remove private financial or login information first.' },
    { title: 'Billing and plan questions', body: 'Include the email on your Dorah account and the plan you are asking about. Never send full card details, a password, or a one-time authentication code.' },
    { title: 'Privacy or data requests', body: 'Use the subject “Privacy request” and tell us whether you need access, correction, export guidance, or account and data deletion support.' },
    { title: 'Security concerns', body: 'Use the subject “Security report” and describe the behaviour, affected page, and approximate time. Do not test against another user’s data or send credentials.' },
    { title: 'Product feedback', body: 'Tell us the job you were trying to complete, not only the feature you want. That context helps us understand what would genuinely make financial control easier.' },
    { title: 'Before you email', body: 'The public Help centre includes step-by-step guides for recording transactions, tracking balances, reviewing accounts, and using Financial Intelligence.' },
  ]} />;
}
