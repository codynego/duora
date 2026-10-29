import type { Metadata } from 'next';
import PublicGuidePage from '@/components/PublicGuidePage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Financial Controller for Small Business', description: 'Dorah gives small-business owners a clearer, everyday view of money coming in, money going out, what is owed, and what needs attention.', path: '/financial-controller' });

export default function FinancialControllerPage() {
  return <PublicGuidePage kicker="Your financial controller" title="The numbers should not be the last thing you find out" description="Dorah helps you stay close to the money while the business is moving—not only when something has already gone wrong." sections={[
    { title: 'Start with what happened', body: 'A sale, an expense, a payment from a customer, or money moved between accounts all tell a different story. Dorah gives each one a proper place, so you are not left trying to explain a total at the end of the week.', points: ['Keep the amount, date, account, and person involved together', 'Tell a customer repayment apart from a new sale', 'Keep internal transfers out of income and expenses'] },
    { title: 'Keep promises in sight', body: 'When a customer says they will pay next week, or a supplier bill is due on Friday, that should stay visible. Dorah keeps those open amounts connected to the people, dates, and records behind them.', points: ['See what customers still owe', 'Spot overdue balances before they get forgotten', 'Review supplier bills before cash is committed elsewhere'] },
    { title: 'Notice the change while it still matters', body: 'A good financial view does more than report a number. It helps you notice that a cost is rising, a collection is late, or an account is moving differently from usual—while there is still time to respond.', points: ['Compare days, weeks, or months in context', 'Ask about sales, customers, and spending in plain language', 'Open the records behind every answer'] },
    { title: 'Be alerted without being alarmed', body: 'Dorah can draw attention to something worth checking, such as a possible duplicate payment or an overdue balance. It explains why it stood out, then leaves the judgement with you.', points: ['Possible issues stay clearly labelled as possible', 'Evidence is shown before a conclusion', 'You choose what to correct, follow up, or leave alone'] },
    { title: 'Work better with the people who advise you', body: 'Dorah does not replace your accountant, auditor, or adviser. It gives you a more organised starting point for the conversations that matter—and a record you can explain.' },
  ]} related={[{ label: 'Explore Financial Intelligence', href: '/financial-intelligence' }, { label: 'See what Dorah can do', href: '/features' }, { label: 'Start with Dorah', href: '/signup' }]} />;
}
