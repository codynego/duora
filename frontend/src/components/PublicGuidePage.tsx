import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { breadcrumbSchema, SITE_URL } from '@/lib/seo';

type GuideSection = { title: string; body: string; points?: string[] };

const PAGE_PATHS: Record<string, string> = {
  'Why Dorah exists': '/about',
  'AI transparency': '/ai-transparency',
  'Plans and usage': '/billing-and-limits',
  'Cash and accounts': '/cash-account-tracking',
  'Customer balances': '/customer-debt-tracking',
  'Your account and data': '/data-and-account-management',
  'Dorah features': '/features',
  'Your financial controller': '/financial-controller',
  'Financial Intelligence': '/financial-intelligence',
  'How Dorah works': '/how-it-works',
  'Product tour': '/product-tour',
  'Security and data': '/security',
  Solutions: '/solutions',
  'Text to transaction': '/text-to-transaction',
};

export default function PublicGuidePage({ path, kicker, title, description, sections, related, cta = 'Get started free', ctaHref = '/signup', numberSections = false }: {
  path?: string;
  kicker: string;
  title: string;
  description: string;
  sections: GuideSection[];
  related: Array<{ label: string; href: string }>;
  cta?: string;
  ctaHref?: string;
  numberSections?: boolean;
}) {
  const pagePath = path ?? PAGE_PATHS[kicker] ?? '/';
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE_URL}${pagePath}#webpage`, url: `${SITE_URL}${pagePath}`, name: title, description, inLanguage: 'en-NG', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#organization` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: kicker, path: pagePath }]),
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><main className="relative overflow-hidden bg-[#F5F7FB] px-5 pb-16 pt-12 text-[#111B33] sm:px-8 sm:pb-24 sm:pt-16">
    <div aria-hidden="true" className="absolute right-[-10rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full border-[5.5rem] border-[#3157F5]/[.06]" />
    <div className="relative mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="text-[10px] font-bold text-[#758096]"><Link href="/" className="transition hover:text-[#3157F5]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span className="text-[#3157F5]">{kicker}</span></nav>
      <header className="mt-10 grid gap-10 border-b border-[#111B33]/10 pb-14 lg:grid-cols-[1.22fr_.78fr] lg:items-end lg:pb-20">
        <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]"><span className="h-0.5 w-7 bg-current" />{kicker}</p><h1 className="mt-6 max-w-4xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.93] tracking-[-.075em] sm:text-6xl lg:text-[clamp(4rem,5.2vw,4.9rem)]">{title}<span className="text-[#3157F5]">.</span></h1></div>
        <div className="border-l-2 border-[#C9F45D] pl-5"><p className="max-w-xl text-base font-medium leading-8 text-[#536078] sm:text-lg sm:leading-9">{description}</p></div>
      </header>
      <section className="mt-12 border-t border-[#111B33]/15 bg-white px-5 sm:px-8 lg:mt-16">
        {sections.map((section, index) => <article key={section.title} className={`grid gap-5 border-b border-[#111B33]/10 py-10 sm:py-12 ${numberSections ? 'lg:grid-cols-[7rem_.75fr_1.25fr]' : 'lg:grid-cols-[.8fr_1.2fr]'} lg:gap-12`}>
          {numberSections && <p className="pt-1 text-[10px] font-black uppercase tracking-[.15em] text-[#3157F5]">Step {String(index + 1).padStart(2, '0')}</p>}
          <h2 className="max-w-lg font-[Aptos_Display,Arial,sans-serif] text-2xl font-black leading-[1.03] tracking-[-.05em] sm:text-3xl">{section.title}</h2>
          <div><p className="max-w-2xl text-sm leading-7 text-[#64708A] sm:text-base sm:leading-8">{section.body}</p>
          {section.points && <ul className="mt-6 grid gap-x-6 gap-y-3 border-t border-[#111B33]/[.08] pt-5 sm:grid-cols-2">{section.points.map((point) => <li key={point} className="flex gap-2 text-xs leading-5 text-[#536078]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#557516]" />{point}</li>)}</ul>}</div>
        </article>)}
      </section>
      <section className="mt-12 grid gap-8 bg-[#111B33] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">A clearer view starts with your records</p><h2 className="mt-4 font-[Aptos_Display,Arial,sans-serif] text-3xl font-black tracking-[-.055em] sm:text-5xl">Bring your business money into view.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Start with the information you have and build a more useful financial picture over time.</p></div>
        <Link href={ctaHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#C9F45D] px-5 text-xs font-black text-[#111B33] transition hover:bg-[#D7FA7D]">{cta}<ArrowRight className="h-4 w-4" /></Link>
      </section>
      <nav aria-label="Related pages" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-[#111B33]/10 pb-8 text-xs font-bold text-[#64708A]">{related.map(({ label, href }) => <Link key={href} href={href} className="transition hover:text-[#3157F5]">{label} <span aria-hidden="true">→</span></Link>)}</nav>
    </div>
  </main></>;
}
