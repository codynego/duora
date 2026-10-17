'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Timer,
  Send,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface WordChallenge {
  id: string;
  category: string;
  letter: string;
  prompt: string;
  validWords: string[];
}

const WORD_CHALLENGES: WordChallenge[] = [
  {
    id: 'w1',
    category: 'Fruit',
    letter: 'M',
    prompt: 'Name a fruit beginning with M',
    validWords: ['mango', 'melon', 'mandarin', 'mulberry'],
  },
  {
    id: 'w2',
    category: 'City',
    letter: 'P',
    prompt: 'Name a major world city beginning with P',
    validWords: ['paris', 'prague', 'porto', 'perth', 'phoenix'],
  },
  {
    id: 'w3',
    category: 'Animal',
    letter: 'O',
    prompt: 'Name an animal beginning with O',
    validWords: ['otter', 'owl', 'octopus', 'ocelot', 'ostrich'],
  },
];

export default function WordBattleStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
}: BaseStageProps) {
  const [round, setRound] = useState(0);
  const [myAnswer, setMyAnswer] = useState('');
  const [myScore, setMyScore] = useState(120);
  const [rivalScore, setRivalScore] = useState(100);
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = WORD_CHALLENGES[round % WORD_CHALLENGES.length];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = myAnswer.trim().toLowerCase();
    if (!clean) return;

    if (clean.startsWith(current.letter.toLowerCase()) && clean.length > 2) {
      setMyScore((s) => s + 30);
      setFeedback(`+30 points for “${myAnswer}”! Excellent!`);
      onSendReaction('cheer');
      onSendMessage(`⚡ Word Battle: Submitted “${myAnswer}” (+30 pts)`);
    } else {
      setFeedback(`Must start with "${current.letter}". Try another!`);
    }
    setMyAnswer('');
  };

  const handleNextRound = () => {
    setRound((r) => r + 1);
    setFeedback(null);
    setMyAnswer('');
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Banner with Game Scores */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
          <Zap className="h-3.5 w-3.5" />
          WORD BATTLE · ROUND {round + 1}
        </span>

        {/* Live Score Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-dark-950 px-3 py-1 text-xs font-bold text-white">
            <span>You:</span>
            <span className="text-spark-coral">{myScore}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-dark-950/10 px-3 py-1 text-xs font-bold text-dark-950">
            <span>Alex:</span>
            <span>{rivalScore}</span>
          </div>
        </div>
      </div>

      {/* Main Challenge Stage */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 text-center sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          CATEGORY: {current.category.toUpperCase()}
        </p>

        <h1 className="mx-auto mt-3 max-w-3xl text-balance text-[clamp(1.75rem,5.2vw,3rem)] font-bold leading-tight tracking-[-0.035em] text-dark-950">
          “{current.prompt}”
        </h1>

        {feedback && (
          <p className="mt-3 text-xs font-bold text-spark-coral animate-fadeIn">
            {feedback}
          </p>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mx-auto mt-7 flex w-full max-w-md gap-2">
          <input
            type="text"
            value={myAnswer}
            onChange={(e) => setMyAnswer(e.target.value)}
            placeholder={`Enter a ${current.category.toLowerCase()}...`}
            autoFocus
            className="min-w-0 flex-1 rounded-full border border-dark-950/15 bg-white px-5 py-3 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!myAnswer.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-spark-coral text-white transition hover:bg-spark-flame disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          Fast reactions and quick vocabulary.
        </span>

        <button
          onClick={handleNextRound}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>Next battle</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
