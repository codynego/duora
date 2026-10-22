import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Help & Support' };

export default function HelpPage() {
  return <PublicInfoPage kicker="We can help" title="Find your way around Dorah." description="If something feels unclear or does not work as expected, support is here to help you get back to the conversation." sections={[
    { title: 'Account access', body: 'Use the sign-in flow to recover access. Never send your password to support or to another person.' },
    { title: 'Privacy questions', body: 'Your public identity is separate from your account credentials. Contact us if you need help with identity, blocking, or revealing controls.' },
    { title: 'Report a problem', body: 'Email support@dorah.me with a short description, the page involved, and any relevant username. Please leave out sensitive credentials.' },
    { title: 'Contact support', body: 'support@dorah.me — we will use your message only to understand and resolve your request.' },
  ]} />;
}
