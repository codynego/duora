import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'AI Transparency', description: 'Understand where Dorah uses AI, what data supports an answer, what remains under backend financial rules, and where human review is required.', path: '/ai-transparency' });

export default function AiTransparencyPage() {
  return <PublicGuidePage kicker="AI transparency" title="AI can help interpret the records. It should not quietly control them" description="Dorah uses AI to make financial entry and exploration more natural while keeping confirmation, validation, calculated totals, and final decisions in clearer boundaries." sections={[
    { title: 'Where AI is used', body: 'AI supports text-to-transaction field extraction and conversational explanations in Financial Intelligence. It may help format an answer or choose a useful comparison.' },
    { title: 'What context may be used', body: 'Depending on the question, Dorah may provide relevant transactions, accounts, customer balances, supplier bills, findings, and a resolved date range so the response can address the business—not a generic example.' },
    { title: 'What AI should not decide', body: 'AI should not authorize a payment, post an unreviewed transaction, calculate the official balance outside backend rules, confirm fraud, or replace tax, legal, accounting, or investment advice.' },
    { title: 'Why answers can still be wrong', body: 'Missing transactions, vague descriptions, incorrect dates, unmatched contacts, model interpretation, or incomplete business context can affect an answer. Open the evidence when the decision matters.' },
    { title: 'How Dorah reduces error', body: 'Generated transaction drafts require confirmation. Financial questions can be routed to deterministic analysis and relevant records, while totals and permissions remain enforced by application logic.' },
    { title: 'How to use it responsibly', body: 'Avoid entering secrets, ask specific questions, include the relevant date when possible, review cited records, and correct the source data rather than only correcting the wording of an answer.' },
  ]} related={[{ label: 'Explore Financial Intelligence', href: '/financial-intelligence' }, { label: 'Learn text-to-transaction', href: '/text-to-transaction' }, { label: 'Read security and data', href: '/security' }]} cta="See the product workflow" ctaHref="/product-tour" />;
}
