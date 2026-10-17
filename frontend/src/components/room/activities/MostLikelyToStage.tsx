'use client';

import React, { useState } from 'react';
import {
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  Lock,
  Crown,
  Smile,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface MostLikelyPrompt {
  id: string;
  question: string;
  mockVotes: Record<string, string>; // voterName -> targetName
}

const PROMPTS: MostLikelyPrompt[] = [
  {
    id: 'p1',
    question: 'Who is most likely to become famous by accident?',
    mockVotes: { Ada: 'Maya', Maya: 'Maya', Jon: 'Maya', Sam: 'You' },
  },
  {
    id: 'p2',
    question: 'Who is most likely to survive a zombie apocalypse entirely on luck?',
    mockVotes: { Ada: 'Jon', Maya: 'Jon', Jon: 'Sam', Sam: 'Jon' },
  },
  {
    id: 'p3',
    question: 'Who is most likely to start a cult unintentionally?',
    mockVotes: { Ada: 'Ada', Maya: 'Ada', Jon: 'Ada', Sam: 'Ada' },
  },
  {
    id: 'p4',
    question: 'Who is most likely to buy something ridiculous after 2 AM?',
    mockVotes: { Ada: 'Sam', Maya: 'Sam', Jon: 'Maya', Sam: 'Sam' },
  },
];

export default function MostLikelyToStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
}: BaseStageProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<'voting' | 'revealed'>('voting');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const currentPrompt = PROMPTS[roundIndex % PROMPTS.length];
  const totalRounds = PROMPTS.length;

  const handleVote = (name: string) => {
    setSelectedTarget(name);
  };

  const handleReveal = () => {
    setPhase('revealed');
  };

  const handleNextRound = () => {
    setRoundIndex((prev) => (prev + 1) % totalRounds);
    setPhase('voting');
    setSelectedTarget(null);
  };

  const allVotes: Record<string, string> = {
    ...currentPrompt.mockVotes,
    ...(selectedTarget ? { You: selectedTarget } : {}),
  };

  // Tally votes for each candidate
  const candidateCounts = Object.values(allVotes).reduce((acc, target) => {
    acc[target] = (acc[target] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCandidates = Object.entries(candidateCounts).sort((a, b) => b[1] - a[1]);
  const winner = sortedCandidates[0];

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Banner */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <Users className="h-3.5 w-3.5" />
            PARTY GAME · ROUND {roundIndex + 1} OF {totalRounds}
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Most Likely To
          </span>
        </div>

        <div>
          {phase === 'voting' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6470]">
              <Lock className="h-3.5 w-3.5 text-spark-coral" />
              Votes are private
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b7d56]">
              <Eye className="h-3.5 w-3.5" />
              Group revealed
            </span>
          )}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          WHO IN THIS ROOM?
        </p>

        <h1 className="mt-2.5 max-w-4xl text-balance text-[clamp(1.5rem,4.6vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] text-dark-950">
          “{currentPrompt.question}”
        </h1>

        <p className="mt-2 text-xs text-[#6F6470]">
          {phase === 'voting'
            ? 'Choose one person. Everyone reveals together.'
            : 'Here is who the room chose!'}
        </p>

        {/* Phase 1: Private Voting on Participants */}
        {phase === 'voting' && (
          <div className="mt-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...participants, { id: 'you', name: 'You', initial: 'Y', color: '#F05A78' }].map((p) => {
                const isSelected = selectedTarget === p.name;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleVote(p.name)}
                    className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition ${
                      isSelected
                        ? 'border-spark-coral bg-[#fff0f3] ring-2 ring-spark-coral'
                        : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                    }`}
                  >
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-base font-bold text-white shadow-sm"
                      style={{ background: p.color }}
                    >
                      {p.initial}
                    </span>
                    <span className="text-xs font-bold text-dark-950">{p.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-[#6F6470]">
              <span>
                {selectedTarget ? `You picked ${selectedTarget}.` : 'Tap someone above to lock in your vote.'}
              </span>

              <button
                onClick={handleReveal}
                className="font-bold text-spark-coral hover:underline"
              >
                Reveal votes now →
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Simultaneous Vote Reveal */}
        {phase === 'revealed' && (
          <div className="mt-6">
            {winner && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#fff0f3] p-4 text-dark-950">
                <Crown className="h-6 w-6 shrink-0 text-spark-coral" />
                <div>
                  <p className="text-sm font-bold text-dark-950">
                    {winner[0]} won with {winner[1]} votes!
                  </p>
                  <p className="text-xs text-[#6F6470]">
                    Ask them to explain how they feel about this title.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {Object.entries(allVotes).map(([voter, target]) => (
                <div
                  key={voter}
                  className="flex items-center justify-between rounded-xl border border-dark-950/10 bg-white px-3.5 py-2.5 text-xs"
                >
                  <span className="font-semibold text-[#6F6470]">{voter} voted for:</span>
                  <span className="font-bold text-spark-coral">{target}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-dark-950/8 pt-5">
        <button
          onClick={() => {
            const comment = `Why did so many people choose ${winner?.[0] ?? 'that'}?! 😂`;
            if (onPromptChat) onPromptChat(comment);
            else onSendMessage(comment);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-3.5 py-2 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
        >
          <Smile className="h-3.5 w-3.5 text-spark-coral" />
          React in chat
        </button>

        <button
          onClick={handleNextRound}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>Next question</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
