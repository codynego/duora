"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Flame,
  Gamepad2,
  Heart,
  MessageCircleHeart,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import AppNav from "@/components/AppNav";

type GameId = "quick-spark" | "predict-me" | "truth-or-dare";
type Message = { from: "ai" | "you"; text: string };

const games: Array<{
  id: GameId;
  title: string;
  description: string;
  icon: typeof Sparkles;
  tint: string;
}> = [
  {
    id: "quick-spark",
    title: "Quick Spark",
    description: "Fast little choices that reveal your kind of fun.",
    icon: Sparkles,
    tint: "bg-[#fff0f3] text-spark-coral",
  },
  {
    id: "predict-me",
    title: "Predict Me",
    description: "Make a guess, then see how close you got.",
    icon: WandSparkles,
    tint: "bg-[#f6f0ff] text-[#775a9b]",
  },
  {
    id: "truth-or-dare",
    title: "Truth or Dare",
    description: "Playful prompts with your comfort level in control.",
    icon: Flame,
    tint: "bg-[#fff5e8] text-[#b77727]",
  },
];

const openingMessages: Record<GameId, string> = {
  "quick-spark": "Let’s start easy. Which sounds more like your perfect unplanned evening?",
  "predict-me": "I’ll make the first guess. Pick the answer that feels most like you, and I’ll tell you what I expected.",
  "truth-or-dare": "Choose your comfort level first. You can always skip anything, no explanation needed.",
};

const choices: Record<GameId, string[]> = {
  "quick-spark": ["A late-night food run", "A long walk with no plan"],
  "predict-me": ["I guessed late-night food run", "I guessed the long walk"],
  "truth-or-dare": ["Keep it light", "A little more honest"],
};

function responseFor(game: GameId, choice: string) {
  if (game === "quick-spark") {
    return choice === "A late-night food run"
      ? "Correct answer. There’s something about a shared snack mission that makes an ordinary night feel like a story. Round two?"
      : "That has quiet-main-character energy. I respect it. Round two: what would make you change your plans?";
  }
  if (game === "predict-me") {
    return choice.includes("food")
      ? "I was close enough to be dangerous. You seem like someone who follows the good idea once it appears."
      : "I missed that one. The long walk wins this round—and I’m updating my theory of you."
  }
  return choice === "Keep it light"
    ? "Good call. We’ll keep it playful: what tiny thing instantly improves your mood?"
    : "A little honesty, never pressure. What is something people usually misunderstand about you? You can skip."
}

export default function DuorahAI() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [choice, setChoice] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [round, setRound] = useState(0);

  const activeGame = useMemo(
    () => games.find((game) => game.id === selectedGame) ?? null,
    [selectedGame],
  );

  function begin(game: GameId) {
    setSelectedGame(game);
    setMessages([{ from: "ai", text: openingMessages[game] }]);
    setChoice("");
    setCustomMessage("");
    setRound(1);
  }

  function choose(value: string) {
    if (!selectedGame) return;
    setChoice(value);
    setMessages((current) => [
      ...current,
      { from: "you", text: value },
      { from: "ai", text: responseFor(selectedGame, value) },
    ]);
    setRound((current) => current + 1);
  }

  function sendCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = customMessage.trim();
    if (!value || !selectedGame) return;
    choose(value);
    setCustomMessage("");
  }

  function reset() {
    setSelectedGame(null);
    setMessages([]);
    setChoice("");
    setRound(0);
  }

  return (
    <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        {activeGame ? (
          <section className="mx-auto max-w-4xl">
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm font-semibold text-dark-950/55 hover:text-dark-950">
              <ArrowLeft className="h-4 w-4" /> Choose another game
            </button>
            <div className="mt-7 overflow-hidden rounded-[32px] bg-dark-950 text-white shadow-[0_24px_70px_rgba(40,29,50,.18)]">
              <div className="relative overflow-hidden px-6 pb-7 pt-7 sm:px-10 sm:pt-9">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-spark-coral/20 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="section-label text-spark-rose">DUORAH AI · BETA</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-[-.06em] sm:text-5xl">{activeGame.title}</h1>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">A small game for right now. I’m AI, clearly labeled, and always happy to take a pass.</p>
                  </div>
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/10 sm:flex">
                    <Bot className="h-7 w-7 text-spark-rose" />
                  </div>
                </div>
                <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-white/55">
                  <span className="h-2 w-2 rounded-full bg-[#74c891]" />
                  Duorah AI is ready · Round {round}
                </div>
              </div>

              <div className="grid gap-5 bg-[#fffaf7] p-4 text-dark-950 sm:p-7 md:grid-cols-[1fr_230px]">
                <div className="rounded-[24px] border border-dark-950/8 bg-white p-5 sm:p-7">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div key={`${message.from}-${index}`} className={`flex ${message.from === "you" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "you" ? "bg-dark-950 text-white" : "bg-[#fff0f3] text-dark-950"}`}>
                          {message.from === "ai" && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-spark-coral">Duorah AI</p>}
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 grid gap-2 sm:grid-cols-2">
                    {choices[activeGame.id].map((value) => (
                      <button key={value} type="button" onClick={() => choose(value)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-spark-coral hover:bg-[#fff8f8] ${choice === value ? "border-spark-coral bg-[#fff0f3]" : "border-dark-950/10 bg-[#fffdfc]"}`}>
                        <span className="flex items-center justify-between gap-3">{value}{choice === value && <Check className="h-4 w-4 text-spark-coral" />}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={sendCustom} className="mt-3 flex gap-2">
                    <input value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} placeholder="Or say it your way…" aria-label="Your answer" className="min-w-0 flex-1 rounded-2xl border border-dark-950/10 bg-[#fffdfc] px-4 py-3 text-sm outline-none placeholder:text-dark-950/35 focus:border-spark-coral" />
                    <button type="submit" aria-label="Send answer" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-spark-coral text-white hover:bg-spark-flame"><Send className="h-4 w-4" /></button>
                  </form>
                </div>

                <aside className="rounded-[24px] bg-[#fff0f3] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-spark-coral"><ShieldCheck className="h-5 w-5" /></div>
                  <h2 className="mt-5 text-lg font-bold tracking-[-.03em]">Your pace, your rules.</h2>
                  <p className="mt-2 text-sm leading-6 text-dark-950/60">Skip any prompt, change games, or leave whenever you want. Nothing is shared with another person.</p>
                  <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-spark-coral"><RefreshCw className="h-4 w-4" /> Start over</button>
                </aside>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[32px] bg-dark-950 px-6 py-8 text-white sm:px-10 sm:py-12">
              <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-spark-coral/25 blur-3xl" />
              <div className="relative max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-spark-rose"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><Bot className="h-4 w-4" /></span> Duorah AI</div>
                <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-[-.07em] sm:text-6xl">Nobody around? Start a spark anyway.</h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/65">Your always-available game partner for quick choices, playful guesses, and conversations with somewhere to go.</p>
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/50"><span className="inline-flex items-center gap-1.5"><MessageCircleHeart className="h-4 w-4 text-spark-rose" /> Takes turns</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-spark-rose" /> You stay in control</span><span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-spark-rose" /> Clearly AI</span></div>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4"><div><p className="section-label">Pick your energy</p><h2 className="mt-3 text-3xl font-bold tracking-[-.055em]">What sounds good?</h2></div><Link href="/experiences" className="hidden items-center gap-1 text-sm font-semibold text-spark-coral sm:inline-flex">Play with someone <ArrowRight className="h-4 w-4" /></Link></div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {games.map(({ id, title, description, icon: Icon, tint }) => (
                  <button key={id} type="button" onClick={() => begin(id)} className="group rounded-[26px] border border-dark-950/10 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-spark-coral/35 hover:shadow-[0_18px_45px_rgba(40,29,50,.09)] sm:p-6">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}><Icon className="h-5 w-5" /></span>
                    <h3 className="mt-7 text-xl font-bold tracking-[-.04em]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6470]">{description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-spark-coral">Start game <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-10 flex flex-col gap-4 rounded-[24px] border border-dark-950/8 bg-[#fff6f2] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3"><Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-spark-coral" /><div><p className="text-sm font-bold">Want to play with a real person?</p><p className="mt-1 text-sm leading-6 text-[#6F6470]">Send the same kind of experience to a friend, date, or partner when you’re ready.</p></div></div>
              <Link href="/experiences/create" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-bold text-white">Create an invite <ArrowRight className="h-4 w-4" /></Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
