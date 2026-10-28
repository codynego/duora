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
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><main className="bg-[#F5F7FB] px-5 pb-16 pt-12 text-[#111B33] sm:px-8 sm:pb-24 sm:pt-16">
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="text-[10px] font-bold text-[#758096]"><Link href="/" className="transition hover:text-[#3157F5]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span className="text-[#3157F5]">{kicker}</span></nav>
      <header className="mt-8 grid gap-6 border-b border-[#111B33]/10 pb-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:pb-14">
        <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" />{kicker}</p><h1 className="mt-5 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.93] tracking-[-.075em] sm:text-6xl lg:text-7xl">{title}<span className="text-[#3157F5]">.</span></h1></div>
        <p className="max-w-xl text-base leading-7 text-[#64708A] sm:text-lg sm:leading-8">{description}</p>
      </header>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
        {sections.map((section, index) => <article key={section.title} className="rounded-2xl border border-[#111B33]/[.07] bg-white p-5 shadow-[0_8px_30px_rgba(17,27,51,.025)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(17,27,51,.07)] sm:p-6">
          {numberSections ? <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Step {String(index + 1).padStart(2, '0')}</p> : <span aria-hidden="true" className="block h-1 w-8 rounded-full bg-[#3157F5]/45" />}<h2 className="mt-3 text-lg font-black tracking-[-.04em]">{section.title}</h2><p className="mt-3 text-sm leading-6 text-[#64708A]">{section.body}</p>
          {section.points && <ul className="mt-4 grid gap-2 border-t border-[#111B33]/[.07] pt-4">{section.points.map((point) => <li key={point} className="flex gap-2 text-xs leading-5 text-[#536078]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#557516]" />{point}</li>)}</ul>}
        </article>)}
      </div>
      <section className="mt-8 grid gap-6 rounded-2xl bg-[#111B33] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#C9F45D]">A clearer view starts with your records</p><h2 className="mt-2 text-2xl font-black tracking-[-.05em] sm:text-3xl">Bring your business money into view.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Start with the information you have and build a more useful financial picture over time.</p></div>
        <Link href={ctaHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C9F45D] px-4 text-xs font-black text-[#111B33] transition hover:bg-[#D7FA7D]">{cta}<ArrowRight className="h-4 w-4" /></Link>
      </section>
      <nav aria-label="Related pages" className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#64708A]">{related.map(({ label, href }) => <Link key={href} href={href} className="transition hover:text-[#3157F5]">{label} <span aria-hidden="true">→</span></Link>)}</nav>
    </div>
  </main></>;
}
