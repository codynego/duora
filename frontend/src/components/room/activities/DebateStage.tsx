'use client';

import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Eye,
  ArrowRight,
  Flame,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { BaseStageProps } from '../types';

type Stance = 'agree' | 'disagree' | 'depends';

interface DebateStatement {
  id: string;
  statement: string;
  context: string;
}

const STATEMENTS: DebateStatement[] = [
  {
    id: 'd1',
    statement: 'Couples should know each other’s phone passwords without hesitation.',
    context: 'Is complete transparency a sign of healthy trust, or does private personal space always matter?',
  },
  {
    id: 'd2',
    statement: 'Staying close friends with an ex is a green flag, not a red flag.',
    context: 'Does it prove emotional maturity and respect, or does it invite unresolved boundaries?',
  },
  {
    id: 'd3',
    statement: 'The person who initiates the first date should always pick up the bill.',
    context: 'Classic etiquette vs. modern egalitarian dating norms.',
  },
  {
    id: 'd4',
    statement: 'You can love someone deeply and still not be compatible long-term.',
    context: 'Can sheer love overcome mismatched life trajectories and daily friction?',
  },
];

export default function DebateStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const statementIndex = typeof gameState.statementIndex === 'number' ? gameState.statementIndex : 0;
  const phase = gameState.phase === 'revealed' || gameState.phase === 'discussion' ? gameState.phase : 'voting';
  const myStance = gameState.myStance === 'agree' || gameState.myStance === 'disagree' || gameState.myStance === 'depends' ? gameState.myStance : null;

  const currentStatement = STATEMENTS[statementIndex % STATEMENTS.length];
  const customTopic = typeof gameState.customTopic === 'string' && gameState.customTopic.trim() ? gameState.customTopic : null;

  const handleSelectStance = (stance: Stance) => {
    onGameStateChange?.({ ...gameState, statementIndex, phase: 'voting', votes: { ...(gameState.votes as Record<string, Stance> | undefined), You: stance }, myStance: stance });
  };

  const handleReveal = () => {
    onGameStateChange?.({ ...gameState, statementIndex, phase: 'revealed', myStance });
  };

  const handleNextStatement = () => {
    onGameStateChange?.({ ...gameState, statementIndex: (statementIndex + 1) % STATEMENTS.length, phase: 'voting', myStance: null, votes: {} });
  };

  const allVotes: Record<string, Stance> = {
    ...((gameState.votes as Record<string, Stance> | undefined) ?? {}),
  };

  const voteCounts = Object.values(allVotes).reduce(
    (acc, st) => {
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    { agree: 0, disagree: 0, depends: 0 } as Record<Stance, number>
  );

  const totalVotes = Object.keys(allVotes).length;

  return (
    <section className="flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
      {/* Top Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <Flame className="h-3.5 w-3.5" />
            DEBATE · ROUND {statementIndex + 1}
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Hearing different perspectives
          </span>
        </div>

        <div>
          {phase === 'voting' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6470]">
              <Lock className="h-3.5 w-3.5 text-spark-coral" />
              Votes are confidential
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b7d56]">
              <Eye className="h-3.5 w-3.5" />
              Group stances revealed
            </span>
          )}
        </div>
      </div>

      {/* Main Statement Stage */}
      <div className="flex w-full max-w-4xl flex-none flex-col py-8 sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          STATEMENT FOR DEBATE
        </p>

        <h1 className="mt-2.5 max-w-3xl break-words text-pretty text-[clamp(1.5rem,4.2vw,2.75rem)] font-bold leading-[1.14] tracking-[-0.035em] text-dark-950">
          “{customTopic ?? currentStatement.statement}”
        </h1>

        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#6F6470] sm:text-sm">
            {customTopic ? 'Take a position, explain your reasoning, and listen for a different angle.' : currentStatement.context}
        </p>

        {/* Phase 1: Private Stance Selection */}
        {phase === 'voting' && (
          <div className="mt-6 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-dark-950/60">
              Where do you stand?
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSelectStance('agree')}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
                  myStance === 'agree'
                    ? 'border-[#3b7d56] bg-[#eef7f1] text-[#2b6142] ring-2 ring-[#3b7d56]'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="text-xs font-bold sm:text-sm">Agree</span>
              </button>

              <button
                onClick={() => handleSelectStance('disagree')}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
                  myStance === 'disagree'
                    ? 'border-spark-coral bg-[#fff0f3] text-spark-coral ring-2 ring-spark-coral'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                <span className="text-xs font-bold sm:text-sm">Disagree</span>
              </button>

              <button
                onClick={() => handleSelectStance('depends')}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
                  myStance === 'depends'
                    ? 'border-spark-amber bg-[#fffbf0] text-[#a16207] ring-2 ring-spark-amber'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="text-xs font-bold sm:text-sm">It depends</span>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-[#6F6470]">
              <span>
                {myStance ? 'Your stance is saved.' : 'Select an option to lock in your position.'}
              </span>

              <button
                onClick={handleReveal}
                className="font-bold text-spark-coral hover:underline"
              >
                Reveal group positions now →
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Stance Breakdown & Deliberation */}
        {phase !== 'voting' && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6F6470]">
              Group Stance Distribution:
            </p>

            {/* Split Visual Bar */}
            <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-dark-950/10">
              <div
                style={{ width: `${(voteCounts.agree / totalVotes) * 100}%` }}
                className="bg-[#4d8568] transition-all duration-500"
                title={`Agree: ${voteCounts.agree}`}
              />
              <div
                style={{ width: `${(voteCounts.disagree / totalVotes) * 100}%` }}
                className="bg-spark-coral transition-all duration-500"
                title={`Disagree: ${voteCounts.disagree}`}
              />
              <div
                style={{ width: `${(voteCounts.depends / totalVotes) * 100}%` }}
                className="bg-spark-amber transition-all duration-500"
                title={`Depends: ${voteCounts.depends}`}
              />
            </div>

            {/* Stance Breakdown Cards */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {/* Agree Column */}
              <div className="rounded-2xl border border-dark-950/10 bg-[#f4faf6] p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3b7d56]">
                  Agree ({voteCounts.agree})
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(allVotes)
                    .filter(([_, st]) => st === 'agree')
                    .map(([name]) => (
                      <span
                        key={name}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dark-950 shadow-sm"
                      >
                        {name}
                      </span>
                    ))}
                </div>
              </div>

              {/* Disagree Column */}
              <div className="rounded-2xl border border-dark-950/10 bg-[#fff3f5] p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-spark-coral">
                  Disagree ({voteCounts.disagree})
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(allVotes)
                    .filter(([_, st]) => st === 'disagree')
                    .map(([name]) => (
                      <span
                        key={name}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dark-950 shadow-sm"
                      >
                        {name}
                      </span>
                    ))}
                </div>
              </div>

              {/* It Depends Column */}
              <div className="rounded-2xl border border-dark-950/10 bg-[#fffbf2] p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#b45309]">
                  It depends ({voteCounts.depends})
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(allVotes)
                    .filter(([_, st]) => st === 'depends')
                    .map(([name]) => (
                      <span
                        key={name}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dark-950 shadow-sm"
                      >
                        {name}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Deliberation Hook */}
            <div className="mt-4 rounded-2xl bg-dark-950/5 p-3.5 text-xs text-dark-950">
              <span className="font-bold">Discussion point: </span>
              Ask someone in the opposing camp to explain the strongest argument for their position.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 pt-5">
        <button
          onClick={() => {
            if (onPromptChat) {
              onPromptChat(`Let's hear both sides for: “${customTopic ?? currentStatement.statement}”`);
            } else {
              onSendMessage(`Let's hear both sides for: “${customTopic ?? currentStatement.statement}”`);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-3.5 py-2 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
        >
          <MessageSquare className="h-3.5 w-3.5 text-spark-coral" />
          Discuss in chat
        </button>

        <button
          onClick={handleNextStatement}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>Next statement</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
