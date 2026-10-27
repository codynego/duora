type PublicInfoPageProps = {
  kicker: string;
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
};

export default function PublicInfoPage({ kicker, title, description, sections }: PublicInfoPageProps) {
  return (
    <main className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <header className="mx-auto max-w-4xl">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]"><span className="h-0.5 w-6 bg-current" />{kicker}</p>
          <h1 className="mt-6 max-w-3xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.94] tracking-[-.07em] sm:text-7xl">{title}<span className="text-[#3157F5]">.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#64708A]">{description}</p>
        </header>
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:mt-20 sm:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-[#111B33]/10 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-black tracking-[-.04em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#64708A]">{section.body}</p>
            </section>
          ))}
        </div>
    </main>
  );
}
