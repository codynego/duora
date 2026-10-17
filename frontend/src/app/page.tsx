'use client';

import { ArrowRight, CalendarDays, HeartHandshake, MessageCircle, Play, Sparkles, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ways = [
  { title: 'Flirt a little.', text: 'Make the first move feel less awkward. Send a playful experience and find new ways to show someone you are interested.', icon: MessageCircle },
  { title: 'Get to know each other.', text: 'Go beyond the usual questions. Compare your choices and discover what makes the two of you click.', icon: HeartHandshake },
  { title: 'Play together.', text: 'Take on challenges, make predictions, and see what happens when you put your answers to the test.', icon: Play },
  { title: 'Make it more interesting.', text: 'Plan a date, revisit a memory, or find fresh ways to keep the spark alive.', icon: CalendarDays },
  { title: 'Meet someone new.', text: 'Discover people with shared interests, then break the ice in a more engaging way.', icon: Users },
];

const experiences = [
  ['Predict My Answer', 'Think you know what they will say? Make your guess, reveal your answers, and find out.'],
  ['Choose Your Move', 'Explore playful scenarios together. Make a choice and discover where the story takes you.'],
  ['Truth or Dare', 'Trade unexpected questions and playful challenges. Keep it funny, flirty, or more personal.'],
  ['The Chemistry Test', 'Explore your similarities, discover your differences, and find new things to talk about.'],
  ['Plan Our Date', 'Compare ideas and turn “What should we do?” into a plan you will both enjoy.'],
];

const stages = [
  ['For the crush', 'You want to say something, but “hey” is not cutting it. Start with something playful and see where it goes.'],
  ['For the talking stage', 'Discover new sides of each other and move beyond predictable conversations.'],
  ['For the person you are dating', 'Create new experiences, plan better dates, and find things to enjoy together.'],
  ['For your person', 'Keep discovering each other, create new memories, and make room for more moments that feel like yours.'],
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-dark-950">
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="absolute -right-28 top-4 -z-10 h-[31rem] w-[31rem] rounded-full bg-[#FFF0F3]" />
          <div className="absolute left-[8%] top-[54%] -z-10 h-32 w-32 rounded-full bg-[#FFF8DC]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <p className="section-label">More than just talking</p>
              <h1 className="mt-5 text-[3.2rem] font-bold leading-[1.02] tracking-[-.065em] text-dark-950 sm:text-7xl">There&apos;s more to connection than just talking.</h1>
              <p className="mt-5 text-2xl font-semibold tracking-[-.04em] text-spark-coral sm:text-3xl">Get closer. Playfully.</p>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#6F6470] sm:text-lg">Turn your crush into a conversation, your talking stage into something exciting, and your relationship into an adventure worth sharing.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#experiences" className="inline-flex items-center justify-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94767]">Start an experience <ArrowRight className="h-4 w-4" /></a>
                <a href="#discover" className="inline-flex items-center justify-center rounded-full border border-[#281D32]/15 px-6 py-3.5 text-sm font-semibold text-dark-950 transition hover:border-spark-coral hover:text-spark-coral">Discover Duora</a>
              </div>
              <p className="mt-6 text-sm text-[#6F6470]">For crushes, talking stages, dates, and couples.</p>
            </div>
            <div className="relative mx-auto w-full max-w-[490px] rounded-[32px] border border-[#281D32]/10 bg-white p-4 soft-shadow sm:p-5">
              <div className="rounded-[22px] bg-[#FFF7F2] p-5 sm:p-7">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6F6470]"><span className="rounded-full bg-white px-3 py-1.5">Just for two</span><span>2 min</span></div>
                <p className="mt-10 text-sm font-semibold text-spark-coral">PREDICT MY ANSWER</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-dark-950">Who is more likely to plan the perfect date?</h2>
                <div className="mt-8 grid grid-cols-2 gap-3"><button className="rounded-2xl border border-spark-coral bg-white p-4 text-left text-sm font-semibold text-dark-950 shadow-sm">Probably me <span className="mt-1 block text-xs font-normal text-[#6F6470]">Your answer</span></button><button className="rounded-2xl border border-[#281D32]/10 bg-white p-4 text-left text-sm font-semibold text-dark-950">Definitely you</button></div>
                <div className="mt-8 flex items-center gap-2 text-xs text-[#6F6470]"><span className="h-2 w-2 rounded-full bg-spark-coral" />Answers reveal together</div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="border-y border-[#281D32]/8 bg-[#FFF7F2] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div><p className="section-label">The big idea</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">So, who&apos;s on your mind?</h2></div>
            <div className="max-w-2xl text-lg leading-8 text-[#6F6470]"><p>That person you&apos;ve been wanting to talk to. The one you&apos;re still figuring out. The person who already knows your favourite things but can still surprise you.</p><p className="mt-5">Whatever your situation, Duora gives you more interesting ways to make a connection happen.</p><p className="mt-7 font-semibold text-dark-950">Not just another conversation. Something you experience together.</p></div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">Explore what you can do</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">One place. So many ways to connect.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ways.map(({ title, text, icon: Icon }, i) => <article key={title} className={`rounded-3xl border p-7 transition hover:-translate-y-1 hover:shadow-lg ${i === 0 ? 'border-[#F7B8C7] bg-[#FFF0F3]' : 'border-[#281D32]/10 bg-white'}`}><Icon className="h-5 w-5 text-spark-coral" strokeWidth={1.8}/><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6F6470]">{text}</p></article>)}</div></div></section>

        <section id="experiences" className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl rounded-[36px] bg-dark-950 px-6 py-14 text-white sm:px-12 sm:py-20"><div className="max-w-2xl"><p className="section-label text-spark-rose">Interactive experiences</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Don&apos;t just ask questions. Find out what happens next.</h2><p className="mt-5 text-base leading-7 text-[#d7cfda]">Duora turns ordinary conversations into experiences you can share.</p></div><div className="mt-12 grid gap-3 md:grid-cols-2">{experiences.map(([title, text], i) => <a href="#start" key={title} className="group rounded-2xl border border-white/12 bg-white/5 p-5 transition hover:border-spark-rose hover:bg-white/10"><div className="flex items-start justify-between gap-4"><span className="text-sm font-semibold text-spark-rose">0{i + 1}</span><ArrowRight className="h-4 w-4 text-spark-rose transition group-hover:translate-x-1" /></div><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#d7cfda]">{text}</p></a>)}</div><a href="#start" className="mt-10 inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold transition hover:bg-[#d94767]">Explore experiences <ArrowRight className="h-4 w-4" /></a></div></section>

        <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">How it works</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Three steps. A whole new way to connect.</h2></div><div className="mt-14 grid gap-10 md:grid-cols-3">{[['01', 'Find your experience', 'Choose what feels right for your situation: flirting, getting to know someone, having fun, or making time together more meaningful.'], ['02', 'Bring your person', 'Invite your crush, date, or partner with a simple link.'], ['03', 'Let the experience unfold', 'Answer, choose, predict, react, and discover. Each experience gives you something to share.']].map(([number, title, text]) => <div key={number} className="border-t border-[#281D32]/15 pt-5"><span className="text-sm font-bold text-spark-coral">{number}</span><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6F6470]">{text}</p></div>)}</div><p className="mt-14 text-lg font-semibold tracking-[-.03em] text-dark-950">The best moments are the ones you didn&apos;t plan.</p></div></section>

        <section className="bg-[#FFF7F2] px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">For every stage</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Wherever you are, there&apos;s a way to get closer.</h2></div><div className="mt-12 grid gap-x-12 gap-y-9 md:grid-cols-2">{stages.map(([title, text]) => <div key={title} className="flex gap-4"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-spark-coral"/><div><h3 className="text-lg font-bold tracking-[-.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6F6470]">{text}</p></div></div>)}</div></div></section>

        <section id="start" className="px-5 py-24 text-center sm:px-8 sm:py-32"><div className="mx-auto max-w-2xl"><Sparkles className="mx-auto h-6 w-6 text-spark-coral" strokeWidth={1.7}/><h2 className="mt-7 text-4xl font-bold tracking-[-.06em] sm:text-6xl">Someone just crossed your mind, didn&apos;t they?</h2><p className="mt-5 text-lg leading-8 text-[#6F6470]">Don&apos;t overthink the first move. Choose an experience, send the invite, and see what happens.</p><a href="#experiences" className="mt-9 inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94767]">Make your first move <ArrowRight className="h-4 w-4" /></a></div></section>
      </main>
      <footer className="border-t border-[#281D32]/10 px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-[#6F6470] sm:flex-row sm:items-center"><div><span className="font-bold tracking-[-.05em] text-dark-950">Duora</span><span className="ml-3">More ways to flirt. More moments worth sharing.</span></div><div className="flex gap-5"><a href="#discover">Discover</a><a href="#experiences">Experiences</a><a href="#">Privacy</a><span>© Duora</span></div></div></footer>
    </div>
  );
}
