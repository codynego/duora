import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Small Business Finance FAQs', description: 'Get answers about Dorah, financial tracking, customer receivables, supplier bills, currency, AI findings, and getting started.', path: '/help' });

const faqs = [
  { question: 'What is Dorah?', answer: 'Dorah is a financial controller workspace for small businesses. It helps bring recorded income, expenses, cash, customer balances, supplier bills, and financial checks into one view.' },
  { question: 'Do I need organized records before I start?', answer: 'No. During setup, tell Dorah whether you use paper, spreadsheets, or do not yet keep organized records. You can start with a business profile and add opening balances or transactions later.' },
  { question: 'Can Dorah track money customers owe and supplier bills?', answer: 'Yes. You can record customer receivables and supplier payables, add due dates, record partial payments, and review the outstanding balance.' },
  { question: 'Does Dorah replace my accountant or bookkeeping system?', answer: 'No. Dorah helps you see and review the financial records you enter. It is not a substitute for professional accounting, tax, compliance, or financial advice.' },
  { question: 'How does Financial Intelligence find issues?', answer: 'Current findings use rule-based checks against saved records, such as overdue balances, upcoming bills, spending increases, and possible duplicates. Findings show their supporting evidence. A possible duplicate is not a confirmed error.' },
  { question: 'Can I ask Dorah questions using AI?', answer: 'AI-generated financial answers are not active yet. The Intelligence page currently shows record-based checks and their evidence; it does not present a chatbot as if it were analyzing your accounts.' },
  { question: 'Which currency does Dorah use?', answer: 'You choose a primary business currency during onboarding. Dorah uses that primary currency for the business overview. Full multi-currency accounting is not currently available.' },
  { question: 'How do I get help with my account?', answer: 'Email support@dorah.me with the page and a short description of the issue. Do not send passwords, full payment-card details, or other credentials.' },
];

export default function HelpPage() {
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
  return <main className="bg-[#F5F7FB] px-5 pb-20 pt-12 text-[#111B33] sm:px-8 sm:pb-28 sm:pt-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
    <header className="mx-auto max-w-5xl"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" />Help and FAQs</p><h1 className="mt-5 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.94] tracking-[-.07em] sm:text-7xl">Clear answers for your financial workspace<span className="text-[#3157F5]">.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#64708A] sm:text-lg sm:leading-8">Learn what Dorah does today, how to get started, and what its financial checks can and cannot tell you.</p></header>
    <section className="mx-auto mt-10 max-w-5xl sm:mt-14" aria-label="Frequently asked questions"><h2 className="mb-4 text-xl font-black tracking-[-.04em]">Frequently asked questions about Dorah</h2><div className="grid gap-3 sm:grid-cols-2">{faqs.map(({ question, answer }) => <details key={question} className="group rounded-xl border border-[#111B33]/[.08] bg-white p-5 open:shadow-[0_10px_32px_rgba(17,27,51,.06)] sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black marker:hidden [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5] transition-transform group-open:rotate-45">+</span></summary><p className="mt-4 border-t border-[#111B33]/[.07] pt-4 text-sm leading-6 text-[#64708A]">{answer}</p></details>)}</div></section>
    <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-xl bg-[#111B33] p-5 text-white sm:p-6"><p className="text-sm font-bold">Still have a question? <a href="mailto:support@dorah.me" className="text-[#C9F45D] underline decoration-[#C9F45D]/40 underline-offset-4">Email Dorah support</a>.</p><Link href="/features" className="inline-flex items-center gap-2 text-xs font-black text-white/75 transition hover:text-white">Explore features <ArrowRight className="h-4 w-4" /></Link></div>
  </main>;
}
