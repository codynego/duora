'use client';

import { ArrowDownRight, ArrowUpRight, Clapperboard, Layers3, MousePointer2, Play, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';

const workflow = [
  { number: '01', title: 'Drop in what shipped', detail: 'Paste the release note, then add the screens that show the feature at its best.', icon: Layers3 },
  { number: '02', title: 'Shape the story', detail: 'Dorah writes a tight launch narrative and builds a scene-by-scene first cut around your brand.', icon: Sparkles },
  { number: '03', title: 'Make the release visible', detail: 'Tweak the words, approve the cut, and export every format your launch needs.', icon: Clapperboard },
];

const deliverables = [
  ['01', 'Launch film', 'A focused 20-second story for your website or product announcement.'],
  ['02', 'Social cuts', 'Vertical and square versions, built from the same source—not cropped afterthoughts.'],
  ['03', 'Release kit', 'The video, the opening line, captions, and a thumbnail ready for the post.'],
];

export default function HomePage() {
  return (
    <div className="motion-site min-h-screen overflow-x-hidden bg-[#F8F5EE] text-[#102126]">
      <Navbar variant="motion" />
      <main>
        <section className="relative overflow-hidden border-b border-[#102126] bg-[#F8F5EE] px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="motion-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
            <div className="max-w-2xl">
              <p className="motion-kicker"><span />For teams that ship</p>
              <h1 className="motion-display mt-6 text-[3.6rem] leading-[.88] tracking-[-.075em] text-[#102126] sm:text-[5.8rem] lg:text-[6.8rem]">Make every release impossible to miss.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#4D5C5B] sm:text-xl">Dorah turns your release notes and real product screens into sharp, on-brand launch videos—without a motion designer or a timeline.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#workflow" className="motion-button motion-button--primary">See the workflow <ArrowDownRight className="h-4 w-4" /></a>
                <a href="#launch-kit" className="motion-button motion-button--secondary">Watch a sample <Play className="h-3.5 w-3.5 fill-current" /></a>
              </div>
              <div className="mt-10 flex items-center gap-4 text-xs font-semibold uppercase tracking-[.13em] text-[#536260]"><span className="h-px w-10 bg-[#536260]" />Real screens. Clear story. Ready to publish.</div>
            </div>

            <div className="relative mx-auto w-full max-w-[690px] lg:justify-self-end">
              <div className="motion-editor relative overflow-hidden border border-[#102126] bg-[#102126] p-3 shadow-[12px_12px_0_#FF6B4A] sm:p-4">
                <div className="flex items-center justify-between border-b border-white/15 px-1 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/55"><span>Release / Q3 dashboard</span><span className="flex items-center gap-2 text-[#7EE7DD]"><span className="h-1.5 w-1.5 rounded-full bg-[#7EE7DD]" />Cut ready</span></div>
                <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_170px]">
                  <div className="relative min-h-[330px] overflow-hidden bg-[#E6DFD0] p-5 sm:min-h-[400px] sm:p-7">
                    <div className="absolute left-0 top-0 h-4 w-24 bg-[#FF6B4A]" /><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#445250]">Scene 03 · product moment</p>
                    <h2 className="motion-display mt-5 max-w-md text-4xl leading-[.88] tracking-[-.07em] text-[#102126] sm:text-5xl">Close the loop before work slips.</h2>
                    <div className="absolute bottom-0 right-0 w-[78%] border-l border-t border-[#102126] bg-[#F8F5EE] p-3 shadow-[-8px_-8px_0_#7EE7DD] sm:p-4">
                      <div className="flex items-center justify-between border-b border-[#102126]/15 pb-2 text-[9px] font-bold uppercase tracking-[.13em] text-[#596765]"><span>Pulse</span><span>Live</span></div>
                      <div className="mt-3 grid grid-cols-[30px_1fr] gap-3"><div className="mt-1 h-7 w-7 rounded-full bg-[#FF6B4A]" /><div><div className="h-2 w-24 bg-[#102126]" /><div className="mt-2 h-1.5 w-full bg-[#C9C3B7]" /><div className="mt-1.5 h-1.5 w-4/5 bg-[#C9C3B7]" /></div></div>
                      <div className="mt-4 flex gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4A]" /><span className="h-1.5 w-1.5 rounded-full bg-[#102126]" /><span className="h-1.5 w-1.5 rounded-full bg-[#102126]/20" /></div>
                    </div>
                    <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#102126] bg-[#F8F5EE] text-[#102126]"><MousePointer2 className="h-4 w-4" /></div>
                  </div>
                  <aside className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">{['01', '02', '03'].map((scene, index) => <div key={scene} className={`relative min-h-[72px] overflow-hidden border border-white/15 p-2 ${index === 2 ? 'bg-[#FF6B4A] text-[#102126]' : 'bg-white/5 text-white'}`}><span className="font-mono text-[9px] font-bold">{scene}</span><div className={`absolute bottom-2 left-2 right-2 h-1 ${index === 2 ? 'bg-[#102126]' : 'bg-white/35'}`} />{index === 0 && <div className="absolute bottom-5 left-2 h-5 w-10 bg-[#7EE7DD]" />}{index === 1 && <div className="absolute bottom-5 left-2 h-5 w-7 bg-[#E6DFD0]" />}</div>)}</aside>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-white/15 pt-3 text-white/70"><Play className="h-4 w-4 fill-current text-[#7EE7DD]" /><div className="h-1 flex-1 bg-white/15"><div className="h-full w-[52%] bg-[#FF6B4A]" /></div><span className="font-mono text-[10px]">00:12 / 00:22</span></div>
              </div>
              <p className="mt-5 text-right font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#536260]">One feature · one clear story · every format</p>
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-[#102126] px-5 py-20 text-[#F8F5EE] sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div><p className="motion-kicker text-[#7EE7DD]"><span className="bg-[#7EE7DD]" />The release desk</p><h2 className="motion-display mt-5 max-w-md text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">A launch video starts with the work you already have.</h2></div><div className="grid gap-px border border-white/20 bg-white/20 md:grid-cols-3">{workflow.map(({ number, title, detail, icon: Icon }) => <article key={number} className="bg-[#102126] p-6 sm:p-7"><div className="flex items-start justify-between"><span className="font-mono text-xs font-bold tracking-[.14em] text-[#7EE7DD]">{number}</span><Icon className="h-5 w-5 text-[#FF6B4A]" /></div><h3 className="mt-14 text-xl font-bold tracking-[-.045em]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{detail}</p></article>)}</div></div></div>
        </section>

        <section id="launch-kit" className="border-b border-[#102126] bg-[#F8F5EE] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl"><div className="grid gap-12 lg:grid-cols-[1fr_.92fr] lg:items-end lg:gap-24"><div><p className="motion-kicker"><span />One story, everywhere it matters</p><h2 className="motion-display mt-5 max-w-2xl text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">Don’t shrink your launch. Recompose it.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#4D5C5B]">Your release needs more than an MP4. Dorah shapes every cut for the place it will actually appear—then gives the rest of the post a head start.</p></div><div className="border border-[#102126] bg-[#FF6B4A] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em]">From one approved cut</p><div className="mt-9 space-y-0 border-t border-[#102126]">{deliverables.map(([number, title, detail]) => <div key={number} className="grid grid-cols-[34px_1fr] gap-4 border-b border-[#102126] py-5"><span className="font-mono text-xs font-bold">{number}</span><div><h3 className="text-xl font-bold tracking-[-.04em]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#3A2520]">{detail}</p></div></div>)}</div></div></div></div>
        </section>

        <section className="bg-[#7EE7DD] px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="motion-kicker"><span className="bg-[#FF6B4A]" />Built for the moment after “ship it”</p><h2 className="motion-display mt-5 text-5xl leading-[.88] tracking-[-.075em] sm:text-7xl">Make the work visible.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-[#254543]">Your product has momentum. Give every meaningful update a launch people can actually see.</p></div><a href="#workflow" className="motion-button motion-button--dark shrink-0">Explore the workflow <ArrowUpRight className="h-4 w-4" /></a></div></section>
      </main>
      <footer className="border-t border-[#102126] bg-[#F8F5EE] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#536260] sm:flex-row sm:items-center"><p className="font-bold text-[#102126]">Dorah<span className="text-[#FF6B4A]">.</span></p><p>Release notes in. Launch videos out.</p><p>© {new Date().getFullYear()} Dorah</p></div></footer>
    </div>
  );
}
