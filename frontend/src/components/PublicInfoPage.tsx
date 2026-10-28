import { breadcrumbSchema, SITE_URL } from '@/lib/seo';

type PublicInfoPageProps = {
  path?: string;
  kicker: string;
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
};

export default function PublicInfoPage({ path, kicker, title, description, sections }: PublicInfoPageProps) {
  const pagePath = path ?? ({ 'Talk to Dorah': '/contact', 'Privacy at Dorah': '/privacy', 'Using Dorah': '/terms' }[kicker] ?? '/');
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE_URL}${pagePath}#webpage`, url: `${SITE_URL}${pagePath}`, name: title, description, inLanguage: 'en-NG', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#organization` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: kicker, path: pagePath }]),
  ] };
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><main className="overflow-hidden bg-[#F5F7FB] px-5 pb-20 pt-16 text-[#111B33] sm:px-8 sm:pb-28 sm:pt-24">
        <header className="mx-auto grid max-w-6xl gap-8 border-b border-[#111B33]/10 pb-14 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:pb-20">
          <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" />{kicker}</p>
          <h1 className="mt-6 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.94] tracking-[-.07em] sm:text-7xl">{title}<span className="text-[#3157F5]">.</span></h1>
          </div><p className="border-l-2 border-[#C9F45D] pl-5 text-lg leading-8 text-[#64708A]">{description}</p>
        </header>
        <div className="mx-auto mt-12 max-w-6xl border-t border-[#111B33]/15 bg-white px-5 sm:px-8 sm:mt-16">
          {sections.map((section) => (
            <section key={section.title} className="grid gap-4 border-b border-[#111B33]/10 py-9 sm:py-11 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
              <h2 className="font-[Aptos_Display,Arial,sans-serif] text-2xl font-black leading-tight tracking-[-.05em]">{section.title}</h2>
              <p className="max-w-2xl text-sm leading-7 text-[#64708A] sm:text-base sm:leading-8">{section.body}</p>
            </section>
          ))}
        </div>
    </main></>
  );
}
