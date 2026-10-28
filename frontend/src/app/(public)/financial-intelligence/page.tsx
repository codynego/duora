import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Financial Intelligence', description: 'Find what needs attention, review the evidence, ask questions of business records, and receive practical next actions without losing sight of uncertainty.', path: '/financial-intelligence' });

export default function FinancialIntelligencePage() {
  return <PublicGuidePage kicker="Financial Intelligence" title="The important question is not “What can AI say?” It is “What should I review next?”" description="Dorah combines supported financial checks, deterministic calculations, relevant business records, and plain-language explanation to help an owner move from a question to evidence." sections={[
    { title: 'Priority findings', body: 'Review issues such as overdue customer debts, upcoming supplier obligations, category spending changes, or possible duplicate transactions.', points: ['Severity is used sparingly', 'Evidence appears beside the finding', 'The next action stays practical'] },
    { title: 'Questions about people and payments', body: 'Ask who owes the most, which customer paid a specific amount recently, what remains outstanding, or which bills are coming due.' },
    { title: 'Questions about sales and behaviour', body: 'Ask which items or services sell more, which days have more recorded customers, how performance changed, or where expenses increased.' },
    { title: 'Date-aware analysis', body: 'Questions can refer to today, yesterday, a named date, a period, or a custom range. Relevant records and computed totals should use that same resolved period.' },
    { title: 'Charts when they earn their space', body: 'A chart may be returned when comparing several dates, categories, products, customers, or trends is clearer visually. A single fact should stay a direct answer.' },
    { title: 'Accuracy has boundaries', body: 'Answers depend on the records saved and the quality of descriptions and contact links. Dorah should state when data is incomplete, avoid presenting possible issues as facts, and keep calculated totals under backend rules.' },
  ]} related={[{ label: 'Read AI transparency', href: '/ai-transparency' }, { label: 'Meet your financial controller', href: '/financial-controller' }, { label: 'Compare AI limits by plan', href: '/billing-and-limits' }]} cta="Open Financial Intelligence" ctaHref="/dashboard/intelligence" />;
}
