"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Heart,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AppNav from "@/components/AppNav";

type GameId = "quick-spark" | "predict-me" | "truth-or-dare";
type Phase = "pick" | "answer" | "ai-turn" | "reveal" | "finished";
type Round = { prompt: string; choices: string[]; aiAnswer: string; aiReaction: string };

const gameLabels: Record<GameId, { title: string; eyebrow: string; description: string; icon: typeof Sparkles }> = {
  "quick-spark": { title: "Quick Spark", eyebrow: "Fast choices", description: "Three easy questions. Your answer, my answer, then a little reveal.", icon: Sparkles },
  "predict-me": { title: "Predict Me", eyebrow: "Read the room", description: "Tell me what you think I’ll pick, then find out how close you got.", icon: CircleHelp },
  "truth-or-dare": { title: "Truth or Dare", eyebrow: "Your comfort level", description: "A gentle version first. You can pass on anything, without explaining why.", icon: Flame },
};

const rounds: Record<GameId, Round[]> = {
  "quick-spark": [
    { prompt: "Your perfect unplanned evening starts with…", choices: ["A late-night food run", "A long walk with no plan", "A film and a phone on silent"], aiAnswer: "A late-night food run", aiReaction: "Good choice. A snack mission has a way of turning into a story." },
    { prompt: "A small thing that instantly makes a day better is…", choices: ["Someone remembering the tiny detail", "A song that arrives at the right moment", "An unexpected plan that actually works"], aiAnswer: "A song that arrives at the right moment", aiReaction: "That one can change the whole temperature of a room." },
    { prompt: "If we had one free hour right now, we should…", choices: ["Find somewhere with good people-watching", "Make something ridiculous to eat", "Take the scenic route home"], aiAnswer: "Find somewhere with good people-watching", aiReaction: "There’s always a good story happening at the next table." },
  ],
  "predict-me": [
    { prompt: "What do you think I’d choose for a first hangout?", choices: ["A quiet café", "A walk somewhere new", "A crowded place with live music"], aiAnswer: "A walk somewhere new", aiReaction: "I like a plan that leaves room for discovering something on the way." },
    { prompt: "Which one do you think I would forgive first?", choices: ["Being five minutes late", "Stealing the last bite", "Sending a terrible pun"], aiAnswer: "Sending a terrible pun", aiReaction: "I can forgive a bad pun if the commitment is strong enough." },
    { prompt: "What do you think I’m most likely to say yes to?", choices: ["A spontaneous road trip", "Trying a new restaurant", "A late-night honest conversation"], aiAnswer: "A late-night honest conversation", aiReaction: "The best conversations usually arrive after the sensible bedtime." },
  ],
  "truth-or-dare": [
    { prompt: "Choose your first lane.", choices: ["Truth: something I’m quietly proud of", "Dare: send a dramatic voice note", "Keep it light"], aiAnswer: "Keep it light", aiReaction: "We’ll warm up first. What tiny thing has been making you smile lately?" },
    { prompt: "What kind of compliment stays with you longest?", choices: ["Something about my character", "Something unexpectedly specific", "Something that makes me laugh"], aiAnswer: "Something unexpectedly specific", aiReaction: "The specific ones feel earned. They say someone was paying attention." },
    { prompt: "Final round: what should we make room for more often?", choices: ["Unhurried mornings", "Saying the honest thing sooner", "Doing something just because it’s fun"], aiAnswer: "Doing something just because it’s fun", aiReaction: "That feels like a good rule to leave the table with." },
  ],
};

export default function DuorahAI() {
  const [game, setGame] = useState<GameId | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const activeGame = game ? gameLabels[game] : null;
  const activeRound = game ? rounds[game][roundIndex] : null;
  const isLastRound = roundIndex === 2;

  useEffect(() => {
    if (phase !== "ai-turn") return;
    const timer = window.setTimeout(() => setPhase("reveal"), 850);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const progress = useMemo(() => `${roundIndex + 1} of 3`, [roundIndex]);

  function startGame(nextGame: GameId) {
    setGame(nextGame); setRoundIndex(0); setAnswer(""); setCustomAnswer(""); setPhase("answer");
  }
  function submitAnswer(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = (answer || customAnswer).trim();
    if (!value) return;
    setAnswer(value); setCustomAnswer(""); setPhase("ai-turn");
  }
  function nextRound() {
    if (isLastRound) { setPhase("finished"); return; }
    setRoundIndex((current) => current + 1); setAnswer(""); setPhase("answer");
  }
  function reset() {
    setGame(null); setPhase("pick"); setRoundIndex(0); setAnswer(""); setCustomAnswer("");
  }

  return <div className="min-h-screen bg-[#f8f4f2] text-dark-950 md:pl-[244px]"><AppNav /><main className="mx-auto max-w-6xl px-5 pb-28 pt-7 sm:px-8 sm:pt-10 md:pb-14">{phase === "pick" ? <PickGame onStart={startGame} /> : <PlayGame activeGame={activeGame!} activeRound={activeRound!} phase={phase} progress={progress} roundIndex={roundIndex} answer={answer} customAnswer={customAnswer} isLastRound={isLastRound} onBack={reset} onAnswer={setAnswer} onCustomAnswer={setCustomAnswer} onSubmit={submitAnswer} onNext={nextRound} onReset={reset} />}</main></div>;
}

function PickGame({ onStart }: { onStart: (game: GameId) => void }) {
  return <><div className="flex items-center justify-between gap-4"><div><p className="section-label">Duorah AI</p><p className="mt-2 text-sm text-dark-950/50">A game partner, clearly AI.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-dark-950/10 bg-white px-3 py-2 text-xs font-semibold text-dark-950/55"><span className="h-2 w-2 rounded-full bg-[#63ae7c]" /> Available now</span></div><section className="relative mt-7 overflow-hidden rounded-[32px] bg-dark-950 px-6 py-9 text-white sm:px-10 sm:py-12"><div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-spark-coral/25 blur-3xl" /><div className="relative max-w-2xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-spark-rose"><Bot className="h-6 w-6" /></div><h1 className="mt-7 max-w-xl text-4xl font-bold leading-[.98] tracking-[-.07em] sm:text-6xl">Let’s make a little moment out of right now.</h1><p className="mt-5 max-w-lg text-base leading-7 text-white/62">Pick a game. I’ll take turns, answer too, and show you what I was thinking after you commit.</p></div></section><section className="mt-9"><div className="flex items-end justify-between"><div><p className="section-label">Choose a table</p><h2 className="mt-2 text-3xl font-bold tracking-[-.055em]">What are you in the mood for?</h2></div><Link href="/experiences" className="hidden items-center gap-1 text-sm font-bold text-spark-coral sm:inline-flex">Play with someone <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-5 grid gap-4 md:grid-cols-3">{(Object.keys(gameLabels) as GameId[]).map((id) => { const item = gameLabels[id]; const Icon = item.icon; return <button key={id} type="button" onClick={() => onStart(id)} className="group rounded-[26px] border border-dark-950/10 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-spark-coral/35 hover:shadow-[0_18px_45px_rgba(40,29,50,.09)] sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0f3] text-spark-coral"><Icon className="h-5 w-5" /></span><p className="mt-6 text-[11px] font-bold uppercase tracking-[.15em] text-spark-coral">{item.eyebrow}</p><h3 className="mt-2 text-xl font-bold tracking-[-.04em]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#6F6470]">{item.description}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-dark-950 group-hover:text-spark-coral">Play one round <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></button>; })}</div></section><p className="mt-8 flex items-center gap-2 text-xs text-dark-950/45"><ShieldCheck className="h-4 w-4 text-spark-coral" /> You can skip, change games, or leave at any time.</p></>;
}

function PlayGame({ activeGame, activeRound, phase, progress, roundIndex, answer, customAnswer, isLastRound, onBack, onAnswer, onCustomAnswer, onSubmit, onNext, onReset }: { activeGame: (typeof gameLabels)[GameId]; activeRound: Round; phase: Phase; progress: string; roundIndex: number; answer: string; customAnswer: string; isLastRound: boolean; onBack: () => void; onAnswer: (value: string) => void; onCustomAnswer: (value: string) => void; onSubmit: (event?: FormEvent<HTMLFormElement>) => void; onNext: () => void; onReset: () => void }) {
  const canSubmit = Boolean(answer || customAnswer.trim());
  return <section className="mx-auto max-w-5xl"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-dark-950/55 hover:text-dark-950"><ArrowLeft className="h-4 w-4" /> Choose another game</button><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]"><div className="overflow-hidden rounded-[30px] bg-white shadow-[0_20px_55px_rgba(40,29,50,.10)]"><header className="border-b border-dark-950/8 px-5 py-5 sm:px-8"><div className="flex items-center justify-between gap-4"><div><p className="section-label">{activeGame.eyebrow}</p><h1 className="mt-2 text-2xl font-bold tracking-[-.05em]">{activeGame.title}</h1></div><span className="text-sm font-bold text-dark-950/45">Round {progress}</span></div><div className="mt-5 flex gap-1.5">{[0, 1, 2].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= roundIndex ? "bg-spark-coral" : "bg-dark-950/8"}`} />)}</div></header><div className="px-5 py-8 sm:px-10 sm:py-12">{phase === "finished" ? <Finished onReset={onReset} /> : phase === "ai-turn" ? <AITurn /> : phase === "reveal" ? <Reveal activeRound={activeRound} answer={answer} isLastRound={isLastRound} onNext={onNext} /> : <Answer activeRound={activeRound} answer={answer} customAnswer={customAnswer} canSubmit={canSubmit} onAnswer={onAnswer} onCustomAnswer={onCustomAnswer} onSubmit={onSubmit} />}</div></div><aside className="h-fit rounded-[26px] bg-dark-950 p-6 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-spark-rose"><Bot className="h-5 w-5" /></span><div><p className="text-sm font-bold">Duorah AI</p><p className="text-xs text-white/45">Taking turns with you</p></div></div><div className="mt-7 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[.15em] text-spark-rose">Good to know</p><p className="mt-3 text-sm leading-6 text-white/60">I’m AI, not another person. I’ll play along, but you stay in control of the pace.</p></div><button type="button" onClick={onReset} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"><RotateCcw className="h-4 w-4" /> Leave game</button></aside></div></section>;
}

function Answer({ activeRound, answer, customAnswer, canSubmit, onAnswer, onCustomAnswer, onSubmit }: { activeRound: Round; answer: string; customAnswer: string; canSubmit: boolean; onAnswer: (value: string) => void; onCustomAnswer: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <><p className="text-xs font-bold uppercase tracking-[.15em] text-spark-coral">Your turn</p><h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-[-.055em] sm:text-4xl">{activeRound.prompt}</h2><p className="mt-3 text-sm text-dark-950/50">Pick one, or write your own answer. I won’t reveal mine until you commit.</p><div className="mt-8 grid gap-3">{activeRound.choices.map((choice) => <button key={choice} type="button" onClick={() => onAnswer(choice)} className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${answer === choice ? "border-spark-coral bg-[#fff0f3]" : "border-dark-950/10 bg-[#fffdfc] hover:border-spark-coral/45"}`}>{choice}{answer === choice && <Check className="h-4 w-4 shrink-0 text-spark-coral" />}</button>)}</div><form onSubmit={onSubmit} className="mt-3 flex gap-2"><input value={customAnswer} onChange={(event) => onCustomAnswer(event.target.value)} placeholder="Or write your own…" aria-label="Your answer" className="min-w-0 flex-1 rounded-2xl border border-dark-950/10 bg-[#fffdfc] px-4 py-3.5 text-sm outline-none placeholder:text-dark-950/35 focus:border-spark-coral" /><button type="submit" disabled={!canSubmit} className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-2xl bg-dark-950 text-white disabled:cursor-not-allowed disabled:opacity-25" aria-label="Lock in answer"><Send className="h-4 w-4" /></button></form><p className="mt-5 text-xs text-dark-950/40">Your answer stays private until you lock it in.</p></>;
}

function AITurn() { return <div className="flex min-h-[390px] flex-col items-center justify-center text-center"><div className="relative grid h-24 w-24 place-items-center rounded-[30px] bg-dark-950 text-spark-rose"><span className="absolute inset-0 animate-ping rounded-[30px] bg-spark-coral/15" /><Bot className="relative h-10 w-10" /></div><p className="mt-8 text-xs font-bold uppercase tracking-[.15em] text-spark-coral">Duorah AI is choosing</p><h2 className="mt-3 text-3xl font-bold tracking-[-.055em]">Hold that thought.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-dark-950/50">I’m taking my turn before we reveal the answers.</p></div>; }

function Reveal({ activeRound, answer, isLastRound, onNext }: { activeRound: Round; answer: string; isLastRound: boolean; onNext: () => void }) { const matched = answer === activeRound.aiAnswer; return <><p className="text-xs font-bold uppercase tracking-[.15em] text-spark-coral">The reveal</p><h2 className="mt-4 text-3xl font-bold tracking-[-.055em] sm:text-4xl">{matched ? "A little overlap." : "That was a plot twist."}</h2><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#fff0f3] p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-spark-coral">You chose</p><p className="mt-3 text-sm font-bold leading-6">{answer}</p></div><div className="rounded-2xl bg-dark-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-spark-rose">Duorah AI chose</p><p className="mt-3 text-sm font-bold leading-6">{activeRound.aiAnswer}</p></div></div><p className="mt-5 rounded-2xl border border-dark-950/8 bg-[#fffdfc] p-4 text-sm leading-6 text-dark-950/65"><span className="font-bold text-dark-950">Duorah AI:</span> {activeRound.aiReaction}</p><button type="button" onClick={onNext} className="mt-7 inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white hover:bg-spark-flame">{isLastRound ? "See my takeaway" : "Next round"}<ArrowRight className="h-4 w-4" /></button></>; }

function Finished({ onReset }: { onReset: () => void }) { return <div className="flex min-h-[390px] flex-col justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f3] text-spark-coral"><Heart className="h-6 w-6" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-spark-coral">Game complete</p><h2 className="mt-3 max-w-lg text-4xl font-bold leading-tight tracking-[-.065em]">You gave the moment somewhere to go.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-dark-950/55">That’s the point of Duorah AI: a small warm-up when nobody is around, then an easy next step when you want to bring someone else in.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/experiences/create" className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Invite someone <ArrowRight className="h-4 w-4" /></Link><button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-dark-950/12 px-5 py-3 text-sm font-bold">Play another <RotateCcw className="h-4 w-4" /></button></div></div>; }
