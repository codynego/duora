import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return <PublicInfoPage kicker="Your business information" title="Know what you share with Dorah." description="Dorah uses the business and account information you provide to deliver its financial overview and related tools." sections={[
    { title: 'Information in your account', body: 'Your account may include contact details and business financial records that you enter or import. Avoid adding passwords, full payment-card details, or information that is not needed for your business records.' },
    { title: 'Your choices', body: 'You choose what financial information to add to Dorah. The insights available to you depend on the information recorded in your account.' },
    { title: 'Keep your account secure', body: 'Use a strong password and contact support if you believe someone has accessed your account without permission.' },
    { title: 'Privacy questions', body: 'For privacy questions or requests, contact support@dorah.me. Never include your password in a message.' },
  ]} />;
}
