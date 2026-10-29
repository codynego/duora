import Link from 'next/link';
import { ArrowRight, Check, Globe2 } from 'lucide-react';
import { breadcrumbSchema, SITE_URL } from '@/lib/seo';

export type SeoLandingPageProps = {
  path: string;
  kicker: string;
  title: string;
  description: string;
  audience: string;
  sections: Array<{ title: string; body: string; points: string[] }>;
  related: Array<{ label: string; href: string }>;
};

export default function SeoLandingPage({ path, kicker, title, description, audience, sections, related }: SeoLandingPageProps) {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title, description, inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: kicker, path }]),
  ] };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <main className="relative overflow-hidden bg-[#F5F7FB] px-5 pb-16 pt-12 text-[#111B33] sm:px-8 sm:pb-24 sm:pt-16">
      <div aria-hidden="true" className="absolute right-[-11rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full border-[5.5rem] border-[#3157F5]/[.06]" />
      <div className="relative mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-[10px] font-bold text-[#758096]"><Link href="/" className="hover:text-[#3157F5]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span className="text-[#3157F5]">{kicker}</span></nav>
        <header className="mt-10 grid gap-10 border-b border-[#111B33]/10 pb-14 lg:grid-cols-[1.16fr_.84fr] lg:items-end lg:pb-20">
          <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3157F5]"><span className="h-0.5 w-7 bg-current" />{kicker}</p><h1 className="mt-6 max-w-4xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.93] tracking-[-.075em] sm:text-7xl">{title}<span className="text-[#3157F5]">.</span></h1></div>
          <div className="border-l-2 border-[#C9F45D] pl-5"><p className="text-base font-medium leading-8 text-[#536078] sm:text-lg sm:leading-9">{description}</p><p className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><Globe2 className="h-4 w-4" />{audience}</p></div>
        </header>
        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => <article key={section.title} className={`rounded-2xl border p-6 ${index === 0 ? 'border-[#111B33] bg-[#111B33] text-white sm:col-span-2 lg:col-span-1' : 'border-[#111B33]/[.08] bg-white'}`}><p className={`text-[10px] font-black uppercase tracking-[.14em] ${index === 0 ? 'text-[#C9F45D]' : 'text-[#3157F5]'}`}>What to look at</p><h2 className="mt-4 text-2xl font-black leading-tight tracking-[-.05em]">{section.title}</h2><p className={`mt-4 text-sm leading-7 ${index === 0 ? 'text-white/65' : 'text-[#64708A]'}`}>{section.body}</p><ul className={`mt-5 grid gap-3 border-t pt-5 ${index === 0 ? 'border-white/15' : 'border-[#111B33]/[.08]'}`}>{section.points.map((point) => <li key={point} className={`flex gap-2 text-xs leading-5 ${index === 0 ? 'text-white/75' : 'text-[#536078]'}`}><Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${index === 0 ? 'text-[#C9F45D]' : 'text-[#557516]'}`} />{point}</li>)}</ul></article>)}
        </section>
        <section className="mt-12 grid gap-8 bg-[#3157F5] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">A clearer view starts with your records</p><h2 className="mt-4 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-3xl font-black tracking-[-.055em] sm:text-5xl">See what your business money is saying.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Dorah helps you record the details, follow what is owed, and investigate changes before they become surprises.</p></div><Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#C9F45D] px-5 text-xs font-black text-[#111B33] hover:bg-[#D7FA7D]">Start with Dorah <ArrowRight className="h-4 w-4" /></Link></section>
        <nav aria-label="Related pages" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-[#111B33]/10 pb-8 text-xs font-bold text-[#64708A]">{related.map(({ label, href }) => <Link key={href} href={href} className="hover:text-[#3157F5]">{label} <span aria-hidden="true">→</span></Link>)}</nav>
      </div>
    </main>
  </>;
}
