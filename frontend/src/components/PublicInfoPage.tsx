import Link from 'next/link';
import Navbar from '@/components/Navbar';

type PublicInfoPageProps = {
  kicker: string;
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
};

export default function PublicInfoPage({ kicker, title, description, sections }: PublicInfoPageProps) {
  return (
    <div className="duora-site min-h-screen bg-[#F3F1EC] text-[#171622]">
      <Navbar />
      <main className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <header className="mx-auto max-w-4xl">
          <p className="eyebrow"><span className="eyebrow-dot" />{kicker}</p>
          <h1 className="display-heading mt-6 max-w-3xl text-5xl leading-[.94] tracking-[-.07em] sm:text-7xl">{title}<span className="text-[#7454A6]">.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#666372]">{description}</p>
        </header>
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:mt-20 sm:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[24px] border border-[#171622]/10 bg-[#FAF9F5] p-6 sm:p-8">
              <h2 className="text-xl font-bold tracking-[-.04em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#666372]">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-4xl border-t border-[#171622]/10 pt-6 text-sm text-[#777381]">
          <Link href="/" className="font-semibold text-[#7454A6] hover:text-[#553781]">Back to Dorah home →</Link>
        </div>
      </main>
      <footer className="border-t border-[#171622]/10 px-5 py-8 text-sm text-[#777381] sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col justify-between gap-3 sm:flex-row">
          <span>© {new Date().getFullYear()} Dorah. All rights reserved.</span>
          <Link href="/signup" className="font-semibold text-[#7454A6] hover:text-[#553781]">Join Dorah →</Link>
        </div>
      </footer>
    </div>
  );
}
