'use client';

import React, { useState } from 'react';
import {
  CalendarHeart,
  Sparkles,
  Check,
  Lock,
  ArrowRight,
  BookmarkCheck,
  Clock,
  DollarSign,
  HeartHandshake,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface PlanPrefs {
  budget: '$' | '$$' | '$$$';
  mood: string;
  time: string;
}

export default function PlanTogetherStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const phase = gameState.phase === 'matched' || gameState.phase === 'confirmed' ? gameState.phase : 'choosing';
  const [myBudget, setMyBudget] = useState<'$' | '$$' | '$$$' | null>(null);
  const [myMood, setMyMood] = useState<string | null>(null);
  const [myTime, setMyTime] = useState<string | null>(null);
  const selectedActivity = typeof gameState.selectedActivity === 'string' ? gameState.selectedActivity : null;

  // Partner's mock preferences for demonstration
  const partnerName = participants[0]?.name ?? 'Partner';
  const partnerPrefs: PlanPrefs = {
    budget: '$$',
    mood: 'Stay-in & cozy',
    time: 'Full evening',
  };

  const handleRevealMatches = () => {
    onGameStateChange?.({ ...gameState, phase: 'matched' });
    onSendReaction('support');
    onSendMessage(`✨ Plan matching revealed for ${partnerName} & You!`);
  };

  const handleSavePlan = (activity: string) => {
    onGameStateChange?.({ ...gameState, selectedActivity: activity, phase: 'confirmed' });
    onSendReaction('cheer');
    onSendMessage(`🎉 Date plan agreed & saved: “${activity}”!`);
  };

  const isFormComplete = myBudget && myMood && myTime;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Banner */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <CalendarHeart className="h-3.5 w-3.5" />
            TOGETHER · PLAN SOMETHING
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Private · 2 People Only
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6470]">
          <HeartHandshake className="h-3.5 w-3.5 text-spark-coral" />
          Finding common ground
        </span>
      </div>

      {/* Main Content */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        {phase === 'choosing' && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
              STEP 1: YOUR PREFERENCES
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              What kind of date sounds right?
            </h1>
            <p className="mt-1 text-xs text-[#6F6470]">
              Choose privately. Duora will highlight the overlapping sweet spots.
            </p>

            <div className="mt-6 space-y-4">
              {/* Budget */}
              <div>
                <span className="text-xs font-bold text-dark-950">1. Budget</span>
                <div className="mt-2 flex gap-2">
                  {(['$', '$$', '$$$'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setMyBudget(b)}
                      className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                        myBudget === b
                          ? 'border-spark-coral bg-[#fff0f3] text-spark-coral ring-1 ring-spark-coral'
                          : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                      }`}
                    >
                      {b === '$' ? '$ (Low-key / Free)' : b === '$$' ? '$$ (Moderate)' : '$$$ (Special treat)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <span className="text-xs font-bold text-dark-950">2. Desired Vibe</span>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {['Stay-in & cozy', 'Out & about', 'Food & drinks', 'Adventure'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMyMood(m)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                        myMood === m
                          ? 'border-spark-coral bg-[#fff0f3] text-spark-coral ring-1 ring-spark-coral'
                          : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <span className="text-xs font-bold text-dark-950">3. Time window</span>
                <div className="mt-2 flex gap-2">
                  {['Quick 1–2 hours', 'Full evening', 'Weekend day'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setMyTime(t)}
                      className={`flex-1 rounded-xl border p-2.5 text-xs font-semibold transition ${
                        myTime === t
                          ? 'border-spark-coral bg-[#fff0f3] text-spark-coral ring-1 ring-spark-coral'
                          : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-[#6F6470]">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-spark-coral" />
                {partnerName} is also picking their preferences.
              </span>

              <button
                onClick={handleRevealMatches}
                disabled={!isFormComplete}
                className="rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900 disabled:opacity-40"
              >
                Reveal overlap →
              </button>
            </div>
          </div>
        )}

        {phase === 'matched' && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-spark-coral">
              OVERLAP FOUND!
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              You both want: {myMood ?? 'Stay-in & cozy'}
            </h1>
            <p className="mt-1 text-xs text-[#6F6470]">
              Both of you aligned on a {myTime ?? 'Full evening'} within a {myBudget ?? '$$'} budget.
            </p>

            {/* Suggested Plans */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-dark-950/60">
                Choose a plan to save together:
              </p>
              {[
                'Cook homemade pasta from scratch with wine & background jazz',
                'Cozy living room blanket fort + movie marathon with favorite snacks',
                'Try a new dessert spot nearby then take a quiet evening walk',
              ].map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleSavePlan(activity)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dark-950/10 bg-white p-4 text-left transition hover:border-spark-coral hover:bg-[#fffaf8]"
                >
                  <span className="text-xs font-bold text-dark-950 sm:text-sm">
                    {activity}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-spark-coral">
                    Select plan →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'confirmed' && (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef7f1] text-[#3b7d56]">
              <BookmarkCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
              Plan saved for You & {partnerName}!
            </h1>
            <p className="mx-auto mt-2 max-w-md rounded-2xl bg-[#fff6f2] p-4 text-sm font-semibold text-dark-950">
              “{selectedActivity}”
            </p>
            <p className="mt-4 text-xs text-[#6F6470]">
              You can revisit this plan anytime under your shared experiences.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          Invite-only experience for 2 people.
        </span>

        {phase === 'confirmed' && (
          <button
            onClick={() => onGameStateChange?.({ ...gameState, phase: 'choosing', selectedActivity: null })}
            className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-4 py-2 text-xs font-bold text-dark-950 hover:bg-dark-950/5"
          >
            Plan another date
          </button>
        )}
      </div>
    </section>
  );
}
