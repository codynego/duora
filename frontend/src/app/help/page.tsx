import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Help & Support' };

export default function HelpPage() {
  return <PublicInfoPage kicker="We can help" title="Get help with your business overview." description="If something feels unclear or does not work as expected, contact the Dorah team for help." sections={[
    { title: 'Account access', body: 'Use the sign-in page to access your account or the password reset flow if you cannot sign in. Never send your password to support.' },
    { title: 'Financial records', body: 'Dorah’s insights depend on the records available to your business. Review the underlying information when something needs investigation.' },
    { title: 'Report a problem', body: 'Email support@dorah.me with a short description and the page involved. Please leave out passwords and sensitive payment details.' },
    { title: 'Contact support', body: 'Email support@dorah.me for account or product questions.' },
  ]} />;
}
