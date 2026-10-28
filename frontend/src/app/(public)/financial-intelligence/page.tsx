import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Financial Intelligence', description: 'Ask practical questions about your saved business records, review what needs attention, and see the evidence behind Dorah’s answers.', path: '/financial-intelligence' });

export default function FinancialIntelligencePage() {
  return <PublicGuidePage kicker="Financial Intelligence" title="Ask the questions you would ask if all your records were already in front of you" description="Financial Intelligence helps you move from “I think something is off” to a specific record, figure, customer, or next step worth reviewing." sections={[
    { title: 'Start with what needs attention', body: 'Some things are easy to miss when you are running the business: a customer who has gone quiet, a supplier payment coming up, a cost that is creeping higher, or two records that look too alike. Dorah brings those things forward with the evidence that made them stand out.', points: ['Focus on the issues that are still unresolved', 'See why a finding matters before acting on it', 'Keep uncertainty visible when the records cannot prove the answer'] },
    { title: 'Ask about customers and payments', body: 'You can ask who owes the business most, whether someone paid a particular amount recently, what remains outstanding, or which bills are close to due. Dorah looks at the saved records that fit the question.' },
    { title: 'Ask what is selling and changing', body: 'You can also look for patterns: which service brought in more money, which day had the most recorded customers, or where spending changed. The useful answer is not just a number—it is the context around it.' },
    { title: 'Be clear about the time you mean', body: 'Today, yesterday, a named date, last month, or a custom range can produce very different answers. Dorah resolves the time period first, then uses records from that same window.' },
    { title: 'Use a chart when a picture is clearer', body: 'A chart can make a trend across products, dates, customers, or categories easier to see. For a single direct question, Dorah should simply give you the answer and the records behind it.' },
    { title: 'Keep the limits in view', body: 'The answer is only as complete as the records you saved. Dorah should say when information is missing, avoid turning a possibility into a fact, and never pretend to replace professional financial advice.' },
  ]} related={[{ label: 'See how AI is used', href: '/ai-transparency' }, { label: 'Meet your financial controller', href: '/financial-controller' }, { label: 'Compare AI limits', href: '/billing-and-limits' }]} cta="Open Financial Intelligence" ctaHref="/dashboard/intelligence" />;
}
