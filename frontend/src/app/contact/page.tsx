import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return <PublicInfoPage kicker="We are listening" title="Tell us what you need." description="Whether you have a question, found a problem, or want to share an idea, the Dorah team is here to listen." sections={[
    { title: 'General support', body: 'Email support@dorah.me for account, privacy, safety, or product questions.' },
    { title: 'What to include', body: 'Tell us what happened, which page you were using, and the Dorah username involved if it is relevant. Do not send passwords.' },
    { title: 'Safety concerns', body: 'If something feels unsafe, say so clearly in your message so it can be reviewed with the right priority.' },
    { title: 'Product ideas', body: 'Dorah is growing with its community. We welcome thoughtful suggestions about questions, conversations, and discovery.' },
  ]} />;
}
