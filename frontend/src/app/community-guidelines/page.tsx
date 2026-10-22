import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Community Guidelines' };

export default function CommunityGuidelinesPage() {
  return <PublicInfoPage kicker="A better kind of conversation" title="Make room for other minds." description="Dorah works when people can be curious, honest, and different without making the space unsafe for everyone else." sections={[
    { title: 'Be human', body: 'Share your own thoughts. Do not impersonate someone else, manipulate people, or use anonymous identity to mislead.' },
    { title: 'Disagree with care', body: 'Challenge ideas without attacking the person behind them. Curiosity is welcome; harassment, threats, and hateful abuse are not.' },
    { title: 'Protect privacy', body: 'Do not publish someone else’s personal information, pressure them to reveal themselves, or use their anonymous identity to identify them.' },
    { title: 'Help keep Dorah useful', body: 'Report content that breaks these guidelines. Repeated abuse can lead to removal of content or account restrictions.' },
  ]} />;
}
