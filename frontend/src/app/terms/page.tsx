import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return <PublicInfoPage kicker="Using Dorah" title="A few simple expectations." description="Dorah is a place for thoughtful participation, mutual choice, and honest conversations." sections={[
    { title: 'Use Dorah responsibly', body: 'You are responsible for the content you share and for respecting other people’s privacy, boundaries, and safety.' },
    { title: 'You must be 18+', body: 'Dorah is intended for adults. Do not create an account or participate if you are under 18.' },
    { title: 'Keep your account secure', body: 'Protect your login details and tell us if you believe someone has accessed your account without permission.' },
    { title: 'Guidelines apply', body: 'Community Guidelines and safety controls are part of using Dorah. We may restrict accounts or remove content that creates harm.' },
  ]} />;
}
