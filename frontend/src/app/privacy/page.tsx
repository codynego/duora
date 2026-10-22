import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Privacy & Anonymity' };

export default function PrivacyPage() {
  return <PublicInfoPage kicker="Your identity is yours" title="Share thoughts, not everything." description="Dorah is built around the idea that meaningful connection can begin before people know who you are in real life." sections={[
    { title: 'What people see', body: 'Public conversations use your Dorah identity. Your email, password, internal account ID, and other private account details are not public.' },
    { title: 'What you control', body: 'You can manage your interests, identity details, notifications, saved content, and safety choices from your account.' },
    { title: 'Revealing identity', body: 'Identity reveal is a mutual choice. Connecting does not automatically reveal your real-world identity.' },
    { title: 'Questions about privacy', body: 'For privacy questions or requests, contact support@dorah.me. Never include your password in a message.' },
  ]} />;
}
