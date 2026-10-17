import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles, Timer, UsersRound } from 'lucide-react';
import AppNav from '@/components/AppNav';

const experiences = [
  ['Predict My Answer', 'Take turns guessing what the other person would say. The reveal does the opening for you.', '2 people · 8 min', '#281D32', 'text-white'],
  ['The Better Question', 'Skip the usual small talk with prompts that give a conversation somewhere to go.', '2–4 people · 15 min', '#FFF0F3', 'text-dark-950'],
  ['Make a Plan', 'Turn shared taste into one specific thing you could actually do together.', '2 people · 10 min', '#FFF8DC', 'text-dark-950'],
];

export default function ExperiencesPage() {
  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav />
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14"><section className="grid gap-7 lg:grid-cols-[1fr_.72fr] lg:items-end"><div><p className="section-label">Experiences</p><h1 className="mt-3 max-w-xl text-4xl font-bold tracking-[-.06em] sm:text-5xl">A better reason to spend time together.</h1></div><p className="max-w-md text-base leading-7 text-[#6F6470]">Not a game for its own sake. Each experience gives you a small shared moment and a natural place to take it next.</p></section>
      <section className="mt-11 grid gap-5 lg:grid-cols-3">{experiences.map(([title, description, meta, color, textColor], index) => <article key={title} className={`flex min-h-[360px] flex-col rounded-[28px] p-7 ${textColor}`} style={{ background: color }}><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-full ${index === 0 ? 'bg-white/10' : 'bg-white/75'}`}>{index === 0 ? <Sparkles className="h-4 w-4 text-spark-rose" /> : <Timer className="h-4 w-4 text-spark-coral" />}</span><span className={`text-xs font-semibold ${index === 0 ? 'text-white/55' : 'text-dark-950/55'}`}>Private by default</span></div><div className="mt-auto"><h2 className="text-2xl font-bold tracking-[-.05em]">{title}</h2><p className={`mt-3 text-sm leading-6 ${index === 0 ? 'text-white/70' : 'text-[#6F6470]'}`}>{description}</p><div className={`mt-6 flex items-center justify-between border-t pt-4 ${index === 0 ? 'border-white/15' : 'border-dark-950/10'}`}><span className={`flex items-center gap-1.5 text-xs font-semibold ${index === 0 ? 'text-white/65' : 'text-[#6F6470]'}`}><UsersRound className="h-3.5 w-3.5" />{meta}</span><Link href="/connections" className={`inline-flex items-center gap-1 text-sm font-bold ${index === 0 ? 'text-spark-rose' : 'text-spark-coral'}`}>Start <ArrowRight className="h-4 w-4" /></Link></div></div></article>)}</section>
      <section className="mt-12 flex flex-col gap-5 rounded-[28px] border border-dark-950/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FFF0F3]"><LockKeyhole className="h-5 w-5 text-spark-coral" /></span><div><h2 className="font-bold tracking-[-.025em]">You set the tone.</h2><p className="mt-1 max-w-xl text-sm leading-6 text-[#6F6470]">Every experience is private when you invite someone. We only share what the group needs to keep a room moving.</p></div></div><Link href="/onboarding" className="shrink-0 text-sm font-bold text-spark-coral">Update preferences →</Link></section>
    </main>
  </div>;
}
