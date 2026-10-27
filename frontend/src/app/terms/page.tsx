import PublicInfoPage from '@/components/PublicInfoPage';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return <PublicInfoPage kicker="Using Dorah" title="A few simple expectations." description="These summary points explain how to use Dorah’s business-finance tools responsibly." sections={[
    { title: 'Your records and decisions', body: 'You are responsible for the financial information you enter or import and for reviewing it for accuracy. Dorah provides financial visibility and explanations; it is not professional accounting, tax, compliance, or financial advice.' },
    { title: 'Use your account responsibly', body: 'Protect your login details and tell us if you believe someone has accessed your account without permission.' },
    { title: 'Review automated insights', body: 'Alerts and recommendations are based on the information available in your account. A flagged discrepancy is a reason to review records, not proof of fraud.' },
    { title: 'Questions', body: 'For questions about these terms, contact support@dorah.me.' },
  ]} />;
}
