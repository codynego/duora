'use client';

import { ArrowUpRight, ChevronDown, Eye, MessageCircle, Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/lib/current-user';
import Navbar from '@/components/Navbar';

const steps = [
  ['01', 'Answer a question', 'A small prompt gives people a way into the parts of themselves they do not usually lead with.'],
  ['02', 'Notice a mind', 'Explore anonymous answers. Follow the ones that feel familiar, surprising, or worth thinking about.'],
  ['03', 'Open a conversation', 'Relate, challenge, or ask more. If the feeling is mutual, choose together whether to reveal yourselves.'],
];

const notes = [
  { text: 'I take time to get comfortable around people. It does not mean I do not want to talk.', tag: 'quietly honest', tone: 'note-lilac' },
  { text: 'I think being understood is sometimes more intimate than being liked.', tag: 'worth sitting with', tone: 'note-citrus' },
  { text: 'The best conversations leave you a little different than they found you.', tag: 'a good question', tone: 'note-peach' },
];

export default function HomePage() {
  const { user, ready } = useCurrentUser();
  const startHref = ready && user ? '/home' : '/signup';

  return (
    <div className="duora-site min-h-screen overflow-x-hidden bg-[#F3F1EC] text-[#171622]">
      <Navbar />
      <main>
        <section className="hero-grid relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
            <div className="relative z-10 max-w-2xl">
              <p className="eyebrow"><span className="eyebrow-dot" />A different kind of discovery</p>
              <h1 className="display-heading mt-6 max-w-[680px] text-[3.55rem] leading-[.94] tracking-[-.07em] sm:text-[5.8rem]">You don’t know who you’ll connect with<span className="text-[#9B84F7]">.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#666372] sm:text-xl">And that’s the interesting part. Discover people through the things they think, the answers they give, and the conversations they start.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href={startHref} className="button-primary group inline-flex items-center justify-center gap-3 rounded-full bg-[#171622] px-6 py-4 text-sm font-semibold text-white">Discover your first thought <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
                <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold text-[#5f5b69] hover:text-[#171622]">See how it works <ChevronDown className="h-4 w-4" /></a>
              </div>
              <p className="mt-6 text-xs font-medium tracking-[.02em] text-[#85818c]">Free to join · Anonymous to start · Real people, real connections</p>
            </div>

            <div className="thought-orbit relative mx-auto h-[450px] w-full max-w-[580px] sm:h-[540px]">
              <div className="orbit-ring orbit-ring--outer" />
              <div className="orbit-ring orbit-ring--inner" />
              <div className="thought-card thought-card--main absolute left-1/2 top-1/2 z-10 w-[min(88%,370px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[#171622] p-6 text-white sm:p-8">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[#B9A7FF]"><span>Anonymous thought</span><Eye className="h-4 w-4" /></div>
                <p className="mt-10 font-serif text-[1.75rem] leading-[1.08] tracking-[-.035em] sm:text-[2.15rem]">What’s something you wish people understood about you?</p>
                <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/55"><span>Someone out there answered this</span><span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 12 thoughts</span></div>
              </div>
              <div className="orbit-satellite satellite--one"><span className="satellite-dot" />curious minds</div>
              <div className="orbit-satellite satellite--two"><Sparkles className="h-3.5 w-3.5" />no profiles needed</div>
              <div className="orbit-satellite satellite--three">stay a little longer<span className="satellite-dot satellite-dot--peach" /></div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[#171622]/10 bg-[#E9E6DF] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
              <div><p className="eyebrow"><span className="eyebrow-dot" />The world behind every answer</p><h2 className="display-heading mt-5 max-w-md text-4xl leading-[.98] tracking-[-.06em] sm:text-6xl">Every thought reveals a little. Never everything.</h2></div>
              <div className="grid gap-0 border-t border-[#171622]/15 sm:grid-cols-3">{steps.map(([number, title, text]) => <article key={number} className="border-b border-[#171622]/15 py-7 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"><span className="font-mono text-xs font-semibold tracking-[.14em] text-[#9B84F7]">{number}</span><h3 className="mt-8 text-xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#666372]">{text}</p></article>)}</div>
            </div>
          </div>
        </section>

        <section id="discover" className="px-5 py-20 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow"><span className="eyebrow-dot" />A small window into someone</p><h2 className="display-heading mt-5 max-w-xl text-4xl leading-[.98] tracking-[-.06em] sm:text-6xl">Explore what people don’t usually say out loud.</h2></div><p className="max-w-xs text-sm leading-6 text-[#777381] sm:pb-1">Examples shown here are imagined. Dorah is new, and the first real thoughts will come from you.</p></div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">{notes.map((note) => <article key={note.text} className={`thought-note ${note.tone} rounded-[24px] p-6 sm:p-7`}><div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[#666372]"><span>Example thought</span><span>↗</span></div><p className="mt-16 min-h-[125px] font-serif text-[1.7rem] leading-[1.05] tracking-[-.035em] text-[#171622]">“{note.text}”</p><div className="mt-8 flex items-center justify-between border-t border-[#171622]/15 pt-4 text-xs font-medium text-[#666372]"><span>{note.tag}</span><span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> Join the thought</span></div></article>)}</div>
            <p className="mt-8 text-sm font-medium text-[#666372]">Moments from anonymous minds · Join conversations · Find the people you didn’t know you were looking for.</p>
          </div>
        </section>

        <section id="safety-support" className="bg-[#171622] px-5 py-20 text-white sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="eyebrow text-[#B9A7FF]"><span className="eyebrow-dot bg-[#B9A7FF]" />Before the face</p><h2 className="display-heading mt-5 max-w-lg text-4xl leading-[.98] tracking-[-.06em] sm:text-6xl">Not every connection starts with a face.</h2></div><div className="grid gap-0 sm:grid-cols-3 sm:pt-8">{[['Think freely.', 'Share without putting your identity on display.'], ['Stay curious.', 'Meet perspectives beyond your usual circle.'], ['Connect by choice.', 'Private connections require mutual agreement.']].map(([title, text]) => <div key={title} className="border-t border-white/15 py-6 sm:px-5 sm:first:pl-0"><h3 className="text-lg font-semibold tracking-[-.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{text}</p></div>)}</div></div>
        </section>

        <section className="px-5 py-24 text-center sm:px-8 sm:py-36"><div className="mx-auto max-w-3xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#D9F36B] text-[#171622]"><Sparkles className="h-5 w-5" /></div><h2 className="display-heading mt-8 text-5xl leading-[.94] tracking-[-.07em] sm:text-7xl">Someone out there might understand you<span className="text-[#9B84F7]">.</span></h2><p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-[#666372]">You don’t need the perfect profile or the perfect opening line. Sometimes, all it takes is one honest answer.</p><a href={startHref} className="button-primary group mt-9 inline-flex items-center gap-3 rounded-full bg-[#171622] px-6 py-4 text-sm font-semibold text-white">Find your first connection <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a><p className="mt-5 text-xs text-[#85818c]">Your next meaningful conversation could start with a single thought.</p></div></section>
      </main>
      <footer className="border-t border-[#171622]/10 bg-[#F3F1EC] px-5 py-14 sm:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><div className="grid gap-10 md:grid-cols-[1.25fr_2fr]"><div><p className="font-serif text-2xl font-extrabold tracking-[-.07em] text-[#171622]">Dorah<span className="text-[#7454A6]">.</span></p><p className="mt-3 max-w-xs text-sm leading-6 text-[#777381]">Discover people through honest conversations.</p></div><div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm sm:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#171622]">Discover</p><div className="mt-4 space-y-3 text-[#777381]"><a href="/moments" className="block hover:text-[#171622]">Moments</a><a href="/discover" className="block hover:text-[#171622]">Discover</a><a href="/how-it-works" className="block hover:text-[#171622]">How Dorah works</a><a href="/install" className="block hover:text-[#171622]">Install Dorah</a></div></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#171622]">Trust & safety</p><div className="mt-4 space-y-3 text-[#777381]"><a href="/safety" className="block hover:text-[#171622]">Safety & support</a><a href="/community-guidelines" className="block hover:text-[#171622]">Community Guidelines</a><a href="/help" className="block hover:text-[#171622]">Help & Support</a></div></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#171622]">Your account</p><div className="mt-4 space-y-3 text-[#777381]"><a href="/privacy" className="block hover:text-[#171622]">Privacy & Anonymity</a><a href="/terms" className="block hover:text-[#171622]">Terms of Service</a><a href="/contact" className="block hover:text-[#171622]">Contact Us</a></div></div></div></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#171622]/10 pt-5 text-xs text-[#85818c] sm:flex-row"><span>© {new Date().getFullYear()} Dorah. All rights reserved.</span><span>Meet through minds. Connect by choice.</span></div></div></footer>
    </div>
  );
}
