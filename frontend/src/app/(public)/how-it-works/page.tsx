import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'How It Works',
  description: 'Get started with Dorah in a few steps: set up your business, record the financial activity you have, and review evidence-backed findings.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return <PublicGuidePage kicker="How Dorah works" title="Start with what you know" description="Dorah is designed to get a business owner into a useful financial workspace quickly. Setup can stay simple while the financial picture grows with your records." sections={[
    { title: 'Set up your business', body: 'Enter your business name, type, country, and preferred primary currency. Tell Dorah how you currently keep records so the workspace can guide your next step.', points: ['Choose the currency used for your main reports', 'Select notebook, spreadsheet, or unstructured records', 'Skip optional setup and continue to the dashboard'] },
    { title: 'Add balances and activity', body: 'Record a starting balance, add existing customer debts and supplier bills, or begin recording new activity from today. You can add contacts and transactions as you go.', points: ['Record income, expenses, and account transfers', 'Track partial payments against an invoice or bill', 'Keep a useful contact history'] },
    { title: 'Review what needs attention', body: 'The Overview summarizes recorded activity. Financial Intelligence lists supported checks, explains the evidence, and links to the records where you can investigate.', points: ['Review overdue customer balances', 'Plan for bills coming due', 'Compare spending changes and possible duplicate records'] },
    { title: 'Make the decision yourself', body: 'Dorah gives you financial visibility and review prompts. Confirm the records and context before changing an entry or making a payment decision.' },
  ]} related={[{ label: 'Explore Dorah features', href: '/features' }, { label: 'Read frequently asked questions', href: '/help' }, { label: 'Compare plans', href: '/pricing' }]} numberSections />;
}
