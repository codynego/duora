'use client';

import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  UsersRound,
  PartyPopper,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  completedByYou: boolean;
  completedByPartner: boolean;
}

const INITIAL_TASKS: ChallengeTask[] = [
  {
    id: 't1',
    title: 'Cook a new meal from scratch together',
    description: 'Pick a recipe neither of you has made before. No takeout backup allowed.',
    completedByYou: true,
    completedByPartner: true,
  },
  {
    id: 't2',
    title: '20-minute evening walk with phones on airplane mode',
    description: 'Leave distractions behind and just walk and talk about your week.',
    completedByYou: true,
    completedByPartner: false,
  },
  {
    id: 't3',
    title: 'Exchange three specific, non-physical compliments',
    description: 'Tell each other about qualities you genuinely admire.',
    completedByYou: false,
    completedByPartner: false,
  },
  {
    id: 't4',
    title: 'Surprise each other with a favorite drink without asking',
    description: 'Coffee, tea, mocktail, or smoothie made exactly how they like it.',
    completedByYou: false,
    completedByPartner: false,
  },
];

export default function SharedChallengesStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
}: BaseStageProps) {
  const [tasks, setTasks] = useState<ChallengeTask[]>(INITIAL_TASKS);
  const partnerName = participants[0]?.name ?? 'Partner';

  const toggleMyTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completedByYou;
          if (nextState) {
            onSendReaction('cheer');
            onSendMessage(`✅ You checked off: “${t.title}”`);
          }
          return { ...t, completedByYou: nextState };
        }
        return t;
      })
    );
  };

  const completedCount = tasks.filter((t) => t.completedByYou && t.completedByPartner).length;
  const isAllComplete = completedCount === tasks.length;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <Trophy className="h-3.5 w-3.5" />
            TOGETHER · CONNECTION CHALLENGE
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            You & {partnerName}
          </span>
        </div>

        <span className="text-xs font-bold text-spark-coral">
          {completedCount} of {tasks.length} fully completed
        </span>
      </div>

      {/* Main Checklist Stage */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          SHARED CHECKLIST
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-dark-950 sm:text-3xl">
          Complete these together this week
        </h1>

        {/* Progress Bar */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-dark-950/10">
          <div
            className="h-full bg-spark-coral transition-all duration-500"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>

        {/* Task Cards */}
        <div className="mt-6 max-h-[42vh] space-y-2.5 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const mutual = task.completedByYou && task.completedByPartner;
            return (
              <div
                key={task.id}
                onClick={() => toggleMyTask(task.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  mutual
                    ? 'border-[#3b7d56] bg-[#f4faf6]'
                    : task.completedByYou
                    ? 'border-spark-coral/40 bg-[#fff9fa]'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-xs font-bold sm:text-sm ${mutual ? 'text-[#2b6142] line-through' : 'text-dark-950'}`}>
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-[#6F6470]">{task.description}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      title="Your status"
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        task.completedByYou ? 'bg-[#3b7d56] text-white' : 'bg-dark-950/10 text-[#6F6470]'
                      }`}
                    >
                      {task.completedByYou ? 'You ✓' : 'You ○'}
                    </span>
                    <span
                      title={`${partnerName}'s status`}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        task.completedByPartner ? 'bg-[#3b7d56] text-white' : 'bg-dark-950/10 text-[#6F6470]'
                      }`}
                    >
                      {task.completedByPartner ? `${partnerName} ✓` : `${partnerName} ○`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isAllComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#eef7f1] p-3 text-xs font-bold text-[#2b6142] animate-bounce">
            <PartyPopper className="h-4 w-4" />
            All challenges complete! You both crushed this challenge together.
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          Tap any challenge to mark your part completed.
        </span>

        <button
          onClick={() => {
            onSendReaction('support');
            onSendMessage(`Cheering on our challenge progress! 💪`);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-4 py-2 text-xs font-bold text-dark-950 hover:bg-dark-950/5"
        >
          <Sparkles className="h-3.5 w-3.5 text-spark-coral" />
          Cheer partner
        </button>
      </div>
    </section>
  );
}
