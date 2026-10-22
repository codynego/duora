import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'How it works' };

export default function HowItWorksPage() {
  return <PublicInfoPage kicker="The Dorah idea" title="Start with a thought." description="Dorah helps people meet through what they think before they decide what to reveal about themselves." sections={[
    { title: 'Answer something honest', body: 'A question gives you a simple way to share a perspective, feeling, or belief without putting your real-world identity on display.' },
    { title: 'Notice a mind', body: 'Browse anonymous moments from people with different interests and experiences. Save, relate, or challenge an idea respectfully.' },
    { title: 'Open a conversation', body: 'When someone interests you, request a connection. Both people choose whether to continue and whether to reveal more.' },
    { title: 'Keep your choice', body: 'You can explore quietly, participate in discussions, or build a private connection at your own pace.' },
  ]} />;
}
