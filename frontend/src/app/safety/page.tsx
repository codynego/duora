import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Safety & support' };

export default function SafetyPage() {
  return <PublicInfoPage kicker="Trust comes first" title="You stay in control." description="Dorah is designed for anonymous-first conversations, with clear ways to protect your space and decide what happens next." sections={[
    { title: 'Anonymous by default', body: 'Your public Dorah identity is separate from your email, real name, and other private account details.' },
    { title: 'Connect by choice', body: 'A connection request does not reveal your identity or open a private chat automatically. Both people must choose to continue.' },
    { title: 'Block and report', body: 'You can block people, report harmful content, and remove your own thoughts. Safety controls should be easy to find when you need them.' },
    { title: 'Need help?', body: 'Contact support@dorah.me and include the page or interaction you are asking about. Do not include a password.' },
  ]} />;
}
