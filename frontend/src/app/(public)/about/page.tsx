import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Quote } from 'lucide-react';
import { breadcrumbSchema, publicPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'About Dorah: Why We Are Building a Financial Controller',
  description: 'Dorah is building a clearer way for small-business owners to understand their money, track what is owed, and know what needs attention next.',
  path: '/about',
  keywords: ['about Dorah', 'financial controller for small business', 'small business finance company'],
});

const beliefs = [
  { label: 'Records before claims', text: 'A useful answer should begin with what the business actually recorded. Totals, findings, and explanations should lead back to the transactions and balances behind them.' },
  { label: 'Clarity before complexity', text: 'Small-business finance is already demanding. The product should make the next decision easier to understand, not introduce another layer of accounting language and crowded reports.' },
  { label: 'Evidence before alarm', text: 'A possible duplicate, cash risk, or overdue balance deserves attention—but uncertainty should remain visible. Dorah should help an owner investigate, not create panic.' },
  { label: 'The owner stays in control', text: 'AI can prepare a draft, organise information, and explain a pattern. It should not quietly post a transaction, authorise a payment, or make the final business decision.' },
];

export default function AboutPage() {
  const aboutUrl = `${SITE_URL}/about`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'AboutPage', '@id': `${aboutUrl}#webpage`, url: aboutUrl, name: 'About Dorah', description: 'Why Dorah is building a financial controller for small-business owners.', inLanguage: 'en-NG', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#organization` }, breadcrumb: { '@id': `${aboutUrl}#breadcrumb` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About Dorah', path: '/about' }]),
  ] };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <main className="overflow-hidden bg-[#F5F7FB] text-[#111B33]">
      <section className="relative border-b border-[#111B33]/10 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        <div aria-hidden="true" className="absolute right-[-9rem] top-[-11rem] h-[28rem] w-[28rem] rounded-full border-[5rem] border-[#3157F5]/[.07]" />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="text-[10px] font-bold text-[#758096]"><Link href="/" className="transition hover:text-[#3157F5]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span className="text-[#3157F5]">About Dorah</span></nav>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]"><span className="h-0.5 w-7 bg-current" />Why we exist</p><h1 className="mt-6 max-w-4xl font-[Aptos_Display,Arial,sans-serif] text-[clamp(3.4rem,8vw,7.6rem)] font-black leading-[.84] tracking-[-.085em]">Business owners deserve to understand <span className="text-[#3157F5]">their own money.</span></h1></div>
            <div className="border-l-2 border-[#C9F45D] pl-5 lg:mb-2"><p className="text-lg font-bold leading-8 tracking-[-.025em] text-[#34415D]">Dorah is building a financial controller for the people who carry the whole business in their heads.</p><p className="mt-4 text-sm leading-7 text-[#64708A]">A clearer record. A more honest picture. A better next decision.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.38fr_1fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">The story behind Dorah</p><div className="mt-7 hidden gap-3 text-[10px] font-black uppercase tracking-[.13em] text-[#758096] lg:flex lg:flex-col lg:items-start"><span className="text-[#3157F5]">Record</span><span className="ml-1 h-14 w-px bg-[#111B33]/15" /><span>Understand</span><span className="ml-1 h-14 w-px bg-[#111B33]/15" /><span className="text-[#557516]">Act</span></div></aside>
          <article className="max-w-3xl">
            <p className="font-[Aptos_Display,Arial,sans-serif] text-3xl font-black leading-[1.08] tracking-[-.055em] text-[#111B33] sm:text-5xl">Most small businesses do not lack effort. They lack one clear, connected view of what their effort produced.</p>
            <div className="mt-10 space-y-7 text-base leading-8 text-[#536078] sm:text-lg sm:leading-9">
              <p>Sales may be written in a notebook. Customer balances live in messages. Supplier bills sit in someone’s memory. Cash is split between a bank account, a POS account, and the money physically on hand. When the owner wants to know where the business stands, the answer has to be assembled from all those places.</p>
              <p>That is the problem Dorah is here to solve.</p>
              <p>We kept returning to the same practical questions: <strong className="font-black text-[#111B33]">What came in? What went out? Who still owes the business? What must be paid next? Is the business actually moving forward?</strong> These are not occasional accounting questions. They shape the decisions an owner makes every day.</p>
              <p>Dorah began with a straightforward idea: if recording money is simple, balances stay connected, and every finding shows its evidence, a business owner can spend less time reconstructing the past and more time deciding what to do next.</p>
              <p>We are not trying to turn every owner into an accountant. We are building the financial awareness an owner needs to run the business with fewer blind spots.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#111B33] px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-20">
          <div><Quote className="h-8 w-8 text-[#C9F45D]" aria-hidden="true" /><p className="mt-8 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[1.02] tracking-[-.06em] sm:text-6xl">A number is only useful when you know what it means—and what to do next.</p></div>
          <div className="lg:pt-16"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">What we are building</p><div className="mt-7 space-y-6 text-base leading-8 text-white/65 sm:text-lg sm:leading-9"><p>Dorah brings transactions, customer debts, supplier bills, cash accounts, and performance into one financial picture. It helps the owner move from a saved record to a balance, from a balance to an issue worth reviewing, and from that issue to the evidence behind it.</p><p>AI makes parts of that journey faster. An owner can describe a transaction in ordinary language or ask a direct question about the business. But speed is not enough. The answer must remain grounded in the records, honest about missing information, and reviewable before it changes anything important.</p></div></div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 border-b border-[#111B33]/10 pb-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">What guides us</p><h2 className="font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.98] tracking-[-.065em] sm:text-6xl">The product should earn trust in the way it handles the truth.</h2></div>
          <div>{beliefs.map((belief, index) => <article key={belief.label} className="grid gap-4 border-b border-[#111B33]/10 py-8 sm:grid-cols-[5rem_.65fr_1.35fr] sm:items-start sm:gap-8 sm:py-10"><span className="text-[10px] font-black tracking-[.14em] text-[#3157F5]">0{index + 1}</span><h3 className="text-xl font-black tracking-[-.04em] sm:text-2xl">{belief.label}</h3><p className="max-w-2xl text-sm leading-7 text-[#64708A] sm:text-base sm:leading-8">{belief.text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#EAF0FF] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]">Where we are going</p><h2 className="mt-6 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.98] tracking-[-.065em] sm:text-6xl">A calmer way to stay close to the business.</h2></div>
          <div><p className="text-base leading-8 text-[#52628F] sm:text-lg sm:leading-9">We want Dorah to become the everyday financial controller for owner-managed businesses: useful enough to open daily, clear enough to understand without specialist training, and disciplined enough to show where every important answer came from.</p><ul className="mt-8 space-y-4 border-t border-[#3157F5]/15 pt-7">{['Fewer forgotten balances and surprise obligations', 'More confidence in the numbers behind a decision', 'Better records to review with an accountant or adviser'].map((item) => <li key={item} className="flex gap-3 text-sm font-bold leading-6 text-[#34415D]"><Check className="mt-1 h-4 w-4 shrink-0 text-[#557516]" />{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="bg-[#3157F5] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">See what we are building</p><h2 className="mt-4 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-4xl font-black leading-[.98] tracking-[-.06em] sm:text-5xl">Start with the records you have.</h2></div>
          <div className="flex flex-wrap gap-3"><Link href="/features" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/25 px-5 text-xs font-black transition hover:bg-white/10">Explore the features <ArrowRight className="h-4 w-4" /></Link><Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#C9F45D] px-5 text-xs font-black text-[#111B33] transition hover:bg-[#D7FA7D]">Get started free <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </main>
  </>;
}
