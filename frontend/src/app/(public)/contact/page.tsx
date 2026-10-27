import PublicInfoPage from '@/components/PublicInfoPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({ title: 'Contact Support', description: 'Contact the Dorah team for help with account access, financial records, product questions, or feedback.', path: '/contact' });

export default function ContactPage() {
  return <PublicInfoPage kicker="We are listening" title="Tell us what you need." description="Questions, feedback, or a problem with Dorah? Get in touch with the team." sections={[
    { title: 'General support', body: 'Email support@dorah.me for account or product questions.' },
    { title: 'What to include', body: 'Tell us what happened and which page you were using. Do not send passwords or full payment credentials.' },
    { title: 'Product feedback', body: 'We welcome feedback on how Dorah can make small-business finances easier to understand.' },
  ]} />;
}
