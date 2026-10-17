'use client';

import { ArrowRight, CalendarDays, HeartHandshake, MessageCircle, Play, Sparkles, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ways = [
  { title: 'Start with someone you know.', text: 'Choose an experience, send one private link, and skip the pressure of inventing a perfect opening.', icon: HeartHandshake },
  { title: 'Meet through something shared.', text: 'Join a small public room where the conversation already has a shape and everyone has a way in.', icon: Users },
  { title: 'Talk beyond small talk.', text: 'Use a good prompt, a clear topic, or a guided question to make the conversation worth having.', icon: MessageCircle },
  { title: 'Play, make, or plan.', text: 'Turn an ordinary evening into a game, a shared creation, a date plan, or a small challenge.', icon: Play },
  { title: 'Keep making time count.', text: 'Return to the people you connected with and start your next shared experience without beginning again.', icon: CalendarDays },
];

const experiences = [
  ['Open Conversation', 'Set a subject, invite a point of view, and give a room a reason to stay curious.'],
  ['Guess My Answer', 'Make your prediction, save your answer, and see where you and the other person overlap.'],
  ['Truth or Dare', 'Choose how open to be, keep it playful, and pass anything that does not feel right.'],
  ['Build a Story', 'Add one sentence at a time and make something no one person could have made alone.'],
  ['Plan Something Together', 'Compare time, budget, and mood until a vague idea becomes an actual plan.'],
];

const stages = [
  ['For someone new', 'Join a small guided room, arrive with a shared activity, and meet people without performing for a feed.'],
  ['For someone on your mind', 'Send a private invitation when a plain “hey” does not say enough.'],
  ['For your partner or friend', 'Make a plan, play a round, or turn an ordinary night into a shared memory.'],
  ['For your own pace', 'Browse, join, invite, or leave. Duora is designed to make connection feel chosen, never forced.'],
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
              <p className="section-label">A better way to spend time together</p>
              <h1 className="mt-5 text-[3.2rem] font-bold leading-[1.02] tracking-[-.065em] text-dark-950 sm:text-7xl">Connection gets easier when there&apos;s something to do together.</h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#6F6470] sm:text-lg">Duora turns conversation, play, and small plans into shared experiences. Invite someone you know, or meet through a room built around a real moment.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94767]">Start an experience <ArrowRight className="h-4 w-4" /></a>
                <a href="#discover" className="inline-flex items-center justify-center rounded-full border border-[#281D32]/15 px-6 py-3.5 text-sm font-semibold text-dark-950 transition hover:border-spark-coral hover:text-spark-coral">See how it works</a>
              </div>
              <p className="mt-6 text-sm text-[#6F6470]">Private invitations or small public rooms. Always on your terms.</p>
            </div>
            <div className="relative mx-auto w-full max-w-[490px] rounded-[32px] border border-[#281D32]/10 bg-white p-4 soft-shadow sm:p-5">
              <div className="rounded-[22px] bg-[#FFF7F2] p-5 sm:p-7">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6F6470]"><span className="rounded-full bg-white px-3 py-1.5">Private room</span><span>2 people · 8 min</span></div>
                <p className="mt-10 text-sm font-semibold text-spark-coral">GUESS MY ANSWER</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-dark-950">What small thing makes you feel genuinely looked after?</h2>
                <div className="mt-8 grid grid-cols-2 gap-3"><button className="rounded-2xl border border-spark-coral bg-white p-4 text-left text-sm font-semibold text-dark-950 shadow-sm">When they remember the little things <span className="mt-1 block text-xs font-normal text-[#6F6470]">Your answer</span></button><button className="rounded-2xl border border-[#281D32]/10 bg-white p-4 text-left text-sm font-semibold text-dark-950">When they make time for me</button></div>
                <div className="mt-8 flex items-center gap-2 text-xs text-[#6F6470]"><span className="h-2 w-2 rounded-full bg-spark-coral" />Answers reveal together</div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="border-y border-[#281D32]/8 bg-[#FFF7F2] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div><p className="section-label">The big idea</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">The hard part is not finding people. It&apos;s finding a way in.</h2></div>
            <div className="max-w-2xl text-lg leading-8 text-[#6F6470]"><p>A blank chat puts too much pressure on a first message. A good shared activity gives everyone a place to begin—and somewhere honest to go next.</p><p className="mt-5">Duora gives a room, a relationship, or an ordinary evening a little structure without making it feel scripted.</p><p className="mt-7 font-semibold text-dark-950">Not another place to scroll. A reason to show up together.</p></div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">What Duora makes possible</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">A shared moment can change the whole conversation.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ways.map(({ title, text, icon: Icon }, i) => <article key={title} className={`rounded-3xl border p-7 transition hover:-translate-y-1 hover:shadow-lg ${i === 0 ? 'border-[#F7B8C7] bg-[#FFF0F3]' : 'border-[#281D32]/10 bg-white'}`}><Icon className="h-5 w-5 text-spark-coral" strokeWidth={1.8}/><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6F6470]">{text}</p></article>)}</div></div></section>

        <section id="experiences" className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl rounded-[36px] bg-dark-950 px-6 py-14 text-white sm:px-12 sm:py-20"><div className="max-w-2xl"><p className="section-label text-spark-rose">Experiences with a purpose</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Choose what you want to do. Let the connection take it from there.</h2><p className="mt-5 text-base leading-7 text-[#d7cfda]">Every Duora experience gives people a shared starting point and a natural next question.</p></div><div className="mt-12 grid gap-3 md:grid-cols-2">{experiences.map(([title, text], i) => <a href="/signup" key={title} className="group rounded-2xl border border-white/12 bg-white/5 p-5 transition hover:border-spark-rose hover:bg-white/10"><div className="flex items-start justify-between gap-4"><span className="text-sm font-semibold text-spark-rose">0{i + 1}</span><ArrowRight className="h-4 w-4 text-spark-rose transition group-hover:translate-x-1" /></div><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#d7cfda]">{text}</p></a>)}</div><a href="/signup" className="mt-10 inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold transition hover:bg-[#d94767]">Explore experiences <ArrowRight className="h-4 w-4" /></a></div></section>

        <section id="how-it-works" className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">How it works</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Pick a shared moment. Make it yours.</h2></div><div className="mt-14 grid gap-10 md:grid-cols-3">{[['01', 'Choose the shape', 'Pick a conversation, game, creation, or plan that matches the time you want to have.'], ['02', 'Invite or discover', 'Send one private link to someone you know, or join a small public room with people who chose the same experience.'], ['03', 'Experience it together', 'Answer, react, build, decide, and follow the thread that feels worth continuing.']].map(([number, title, text]) => <div key={number} className="border-t border-[#281D32]/15 pt-5"><span className="text-sm font-bold text-spark-coral">{number}</span><h3 className="mt-8 text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6F6470]">{text}</p></div>)}</div><p className="mt-14 text-lg font-semibold tracking-[-.03em] text-dark-950">No feed to keep up with. Just a better reason to spend time together.</p></div></section>

        <section className="bg-[#FFF7F2] px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="section-label">For every kind of connection</p><h2 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">However you arrive, there is a better way to begin.</h2></div><div className="mt-12 grid gap-x-12 gap-y-9 md:grid-cols-2">{stages.map(([title, text]) => <div key={title} className="flex gap-4"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-spark-coral"/><div><h3 className="text-lg font-bold tracking-[-.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6F6470]">{text}</p></div></div>)}</div></div></section>

        <section id="start" className="px-5 py-24 text-center sm:px-8 sm:py-32"><div className="mx-auto max-w-2xl"><Sparkles className="mx-auto h-6 w-6 text-spark-coral" strokeWidth={1.7}/><h2 className="mt-7 text-4xl font-bold tracking-[-.06em] sm:text-6xl">Make the next moment easier to begin.</h2><p className="mt-5 text-lg leading-8 text-[#6F6470]">Choose an experience, invite someone in, or join a room with a reason to talk. The rest can unfold from there.</p><a href="/signup" className="mt-9 inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94767]">Create your account <ArrowRight className="h-4 w-4" /></a></div></section>
      </main>
      <footer className="border-t border-[#281D32]/10 px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-[#6F6470] sm:flex-row sm:items-center"><div><span className="font-bold tracking-[-.05em] text-dark-950">Duora</span><span className="ml-3">A better reason to spend time together.</span></div><div className="flex gap-5"><a href="#discover">Why Duora</a><a href="#experiences">Experiences</a><a href="#">Privacy</a><span>© Duora</span></div></div></footer>
    </div>
  );
}
