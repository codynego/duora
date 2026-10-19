'use client';

import React, { useState } from 'react';
import {
  Zap,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BaseStageProps, currentPlayerId } from '../types';
import { ADDITIONAL_QUICK_TAKES } from './additional-game-content';
import { getSavedDeckIndex, saveDeckIndex, shuffledDeck } from './prompt-deck';

type TakeReaction = 'agree' | 'disagree' | 'depends';

interface QuickTakeItem {
  id: string;
  statement: string;
}

const BASE_QUICK_TAKES: QuickTakeItem[] = [
  {
    id: 't1',
    statement: 'Voice notes are strictly superior to text messages.',
  },
  {
    id: 't2',
    statement: 'Ordering dessert for the table is better than ordering individual desserts.',
  },
  {
    id: 't3',
    statement: 'Leaving a party without saying goodbye (the Irish Exit) is respectful, not rude.',
  },
  {
    id: 't4',
    statement: 'Social media stalking before a first date ruins the organic chemistry.',
  },
  {
    id: 't5',
    statement: 'Sunday afternoon anxiety can only be cured by an early dinner and no screens.',
  },
];

const QUICK_TAKES: QuickTakeItem[] = [
  ...BASE_QUICK_TAKES,
  ...ADDITIONAL_QUICK_TAKES.map((statement, index) => ({ id: `extra-take-${index + 1}`, statement })),
];

export default function QuickTakesStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const takeIndex = typeof gameState.takeIndex === 'number' ? gameState.takeIndex : 0;
  const playerId = currentPlayerId(participants);
  const allReactions: Record<string, TakeReaction> = { ...((gameState.reactions as Record<string, TakeReaction> | undefined) ?? {}) };
  const myReaction = allReactions[playerId] ?? null;
  const deckInitialized = React.useRef(false);

  const takeDeck = React.useMemo(() => shuffledDeck(QUICK_TAKES), []);
  const currentTake = takeDeck[takeIndex % takeDeck.length];
  const customTopic = takeIndex === 0 && typeof gameState.customTopic === 'string' && gameState.customTopic.trim() ? gameState.customTopic : null;
  const totalTakes = QUICK_TAKES.length;

  React.useEffect(() => {
    if (!isHost || deckInitialized.current || typeof gameState.takeIndex === 'number') return;
    deckInitialized.current = true;
    const savedIndex = getSavedDeckIndex('quick-takes', takeDeck.length);
    if (savedIndex > 0) onGameStateChange?.({ ...gameState, takeIndex: savedIndex });
  }, [gameState, isHost, onGameStateChange, takeDeck.length]);

  const handleReact = (reaction: TakeReaction) => {
    onGameStateChange?.({ ...gameState, takeIndex, reactions: { ...allReactions, [playerId]: reaction } });
  };

  const handleNextTake = () => {
    if (!isHost) return;
    const nextIndex = (takeIndex + 1) % takeDeck.length;
    saveDeckIndex('quick-takes', nextIndex, takeDeck.length);
    onGameStateChange?.({ ...gameState, takeIndex: nextIndex, reactions: {}, customTopic: '' });
  };

  const counts = Object.values(allReactions).reduce(
    (acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    { agree: 0, disagree: 0, depends: 0 } as Record<TakeReaction, number>
  );

  const total = Object.keys(allReactions).length;

  return (
    <section className="game-stage game-stage--quick flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
          <Zap className="h-3.5 w-3.5" />
          QUICK TAKES · {takeIndex + 1} OF {totalTakes}
        </span>
        <span className="text-xs text-[#6F6470]">React fast. Don’t overthink it.</span>
      </div>

      {/* Main Statement Stage */}
      <div className="flex w-full max-w-4xl flex-none flex-col justify-center py-8 text-center sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          HOT TAKE
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl break-words text-pretty text-[clamp(1.6rem,4.4vw,2.85rem)] font-bold leading-[1.12] tracking-[-0.035em] text-dark-950">
          “{customTopic ?? currentTake.statement}”
        </h1>

        {/* Reaction Action Buttons */}
        <div className="mx-auto mt-7 grid w-full max-w-md gap-2 sm:mt-8 sm:flex sm:items-center sm:justify-center sm:gap-3">
          <button
            onClick={() => handleReact('agree')}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition sm:w-auto sm:rounded-full sm:text-sm ${
              myReaction === 'agree'
                ? 'border-[#3b7d56] bg-[#eef7f1] text-[#2b6142] ring-2 ring-[#3b7d56]'
                : 'border-dark-950/12 bg-white text-dark-950 hover:border-dark-950/30'
            }`}
          >
            <Check className="h-4 w-4" />
            Agree
          </button>

          <button
            onClick={() => handleReact('disagree')}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition sm:w-auto sm:rounded-full sm:text-sm ${
              myReaction === 'disagree'
                ? 'border-spark-coral bg-[#fff0f3] text-spark-coral ring-2 ring-spark-coral'
                : 'border-dark-950/12 bg-white text-dark-950 hover:border-dark-950/30'
            }`}
          >
            <X className="h-4 w-4" />
            Disagree
          </button>

          <button
            onClick={() => handleReact('depends')}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition sm:w-auto sm:rounded-full sm:text-sm ${
              myReaction === 'depends'
                ? 'border-spark-amber bg-[#fffbf0] text-[#a16207] ring-2 ring-spark-amber'
                : 'border-dark-950/12 bg-white text-dark-950 hover:border-dark-950/30'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Depends
          </button>
        </div>

        {/* Instant Reveal Breakdown (Appears as soon as user taps or auto-reveals) */}
        {myReaction && (
          <div className="mx-auto mt-8 w-full max-w-lg animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6F6470]">
              <span>Group reaction</span>
              <span>{total} people answered</span>
            </div>

            <div className="mt-2 flex h-3.5 overflow-hidden rounded-full bg-dark-950/10">
              <div
                style={{ width: `${total ? (counts.agree / total) * 100 : 0}%` }}
                className="bg-[#4d8568] transition-all"
                title={`Agree: ${counts.agree}`}
              />
              <div
                style={{ width: `${total ? (counts.disagree / total) * 100 : 0}%` }}
                className="bg-spark-coral transition-all"
                title={`Disagree: ${counts.disagree}`}
              />
              <div
                style={{ width: `${total ? (counts.depends / total) * 100 : 0}%` }}
                className="bg-spark-amber transition-all"
                title={`Depends: ${counts.depends}`}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-[#6F6470]">
              <span className="text-[#3b7d56] font-bold">Agree {total ? Math.round((counts.agree / total) * 100) : 0}%</span>
              <span className="text-spark-coral font-bold">Disagree {total ? Math.round((counts.disagree / total) * 100) : 0}%</span>
              <span className="text-[#b45309] font-bold">Depends {total ? Math.round((counts.depends / total) * 100) : 0}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Rapid Next Button */}
      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 pt-5">
        <span className="text-xs text-[#6F6470]">
          Brief reactions. The game keeps moving.
        </span>

        <button
          onClick={handleNextTake}
          disabled={!isHost}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>{isHost ? 'Next take' : 'Host controls next take'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
