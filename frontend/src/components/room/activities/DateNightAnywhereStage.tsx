'use client';

import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Flame,
  MessageCircle,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { BaseStageProps } from '../types';
import { ADDITIONAL_DATE_MEMORIES } from './additional-game-content';

const DATE_MEMORIES = [
  'A dedicated date night with phones locked away',
  'Cooking a new special dinner recipe together on a Friday',
  'Taking a Sunday afternoon walk to explore a new neighborhood',
  ...ADDITIONAL_DATE_MEMORIES,
];

export default function DateNightAnywhereStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const chapter = gameState.chapter === 2 || gameState.chapter === 3 ? gameState.chapter : 1;
  const [playAnswer, setPlayAnswer] = useState<string | null>(null);
  const [talkAnswer, setTalkAnswer] = useState('');
  const savedMemory = typeof gameState.savedMemory === 'string' ? gameState.savedMemory : null;

  const partnerName = participants.find((person) => !person.isYou)?.name ?? 'your partner';

  const handleNextChapter = () => {
    if (chapter < 3) {
      onGameStateChange?.({ ...gameState, chapter: chapter + 1 });
      onSendReaction('support');
    }
  };

  const handleFinish = (memory: string) => {
    onGameStateChange?.({ ...gameState, chapter: 3, savedMemory: memory });
    onSendReaction('cheer');
    onSendMessage(`💌 Date Night takeaway saved: “${memory}”`);
  };

  return (
    <section className="game-stage game-stage--date flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Banner */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <Heart className="h-3.5 w-3.5" />
            DATE NIGHT ANYWHERE · CHAPTER {chapter} OF 3
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            You & {partnerName}
          </span>
        </div>

        {/* 3 Step Pill Indicator */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-1.5 w-6 rounded-full transition-all ${
                step <= chapter ? 'bg-spark-coral' : 'bg-dark-950/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Chapter Content */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        {/* Chapter 1: Play */}
        {chapter === 1 && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-spark-coral">
              PART 1 · PLAYFUL WARM-UP
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              Would You Rather: Spend a spontaneous 48 hours in bustling Tokyo or a secluded rainy cottage in the Scottish Highlands?
            </h1>
            <p className="mt-2 text-xs text-[#6F6470]">
              Pick your answer and see if your partner aligns with your travel mood.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlayAnswer('Tokyo')}
                className={`rounded-2xl border p-4 text-left transition ${
                  playAnswer === 'Tokyo'
                    ? 'border-spark-coral bg-[#fff0f3] font-bold text-spark-coral ring-1 ring-spark-coral'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <span className="block text-sm">Neon lights & ramen in Tokyo</span>
              </button>
              <button
                onClick={() => setPlayAnswer('Highlands')}
                className={`rounded-2xl border p-4 text-left transition ${
                  playAnswer === 'Highlands'
                    ? 'border-spark-coral bg-[#fff0f3] font-bold text-spark-coral ring-1 ring-spark-coral'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <span className="block text-sm">Fireplace & rain in Highlands</span>
              </button>
            </div>
          </div>
        )}

        {/* Chapter 2: Talk */}
        {chapter === 2 && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-spark-coral">
              PART 2 · DEEPER CONNECTION
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              What is one small thing I do that makes you feel appreciated or cared for?
            </h1>
            <p className="mt-2 text-xs text-[#6F6470]">
              Take your time. You can say it out loud or jot down a sweet note below.
            </p>

            <textarea
              value={talkAnswer}
              onChange={(e) => setTalkAnswer(e.target.value)}
              placeholder="Write a thought or discuss together..."
              rows={3}
              className="mt-5 w-full resize-none rounded-2xl border border-dark-950/12 bg-white p-4 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 sm:text-sm"
            />
          </div>
        )}

        {/* Chapter 3: Takeaway / Memory */}
        {chapter === 3 && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-spark-coral">
              PART 3 · A MEMORY TO KEEP
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              What is one thing we want to make time for before this month ends?
            </h1>

            <div className="mt-6 space-y-2.5">
              {DATE_MEMORIES.map((memory) => (
                <button
                  key={memory}
                  onClick={() => handleFinish(memory)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    savedMemory === memory
                      ? 'border-[#3b7d56] bg-[#eef7f1] text-[#2b6142] ring-1 ring-[#3b7d56]'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                  }`}
                >
                  <span className="text-xs font-bold sm:text-sm">{memory}</span>
                  {savedMemory === memory && <Check className="h-4 w-4 text-[#3b7d56]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          {chapter < 3 ? 'Move to next chapter when you both feel ready.' : 'Date night complete!'}
        </span>

        {chapter < 3 ? (
          <button
            onClick={handleNextChapter}
            className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-2.5 text-xs font-bold text-white transition hover:bg-spark-flame"
          >
            <span>Continue journey</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#3b7d56]">
            <BookmarkCheck className="h-4 w-4" />
            Saved to our memories
          </span>
        )}
      </div>
    </section>
  );
}
