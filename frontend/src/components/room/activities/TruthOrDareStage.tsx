'use client';

import React from 'react';
import {
  Flame,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface ChallengeCard {
  id: string;
  truth: string;
  dare: string;
}

const CHALLENGES: ChallengeCard[] = [
  {
    id: 'c1',
    truth: 'What is the most awkward lie you have ever told to get out of social plans?',
    dare: 'Show the most recent photo in your camera roll (or describe it in full detail).',
  },
  {
    id: 'c2',
    truth: 'What is a habit you secretly judge other people for, even if you do it too?',
    dare: 'Do your best dramatic impression of someone else in this room for 15 seconds.',
  },
  {
    id: 'c3',
    truth: 'What is something you searched online this week that you would be embarrassed to admit?',
    dare: 'Speak in a fake accent of the group’s choice until your next turn.',
  },
  {
    id: 'c4',
    truth: 'Who was your most embarrassing childhood celebrity crush?',
    dare: 'Send an out-of-context voice note or emoji reaction in the chat right now.',
  },
];

export default function TruthOrDareStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const turnIndex = typeof gameState.turnIndex === 'number' ? gameState.turnIndex : 0;
  const choice = gameState.choice === 'truth' || gameState.choice === 'dare' ? gameState.choice : null;
  const status = gameState.status === 'active' || gameState.status === 'completed' || gameState.status === 'passed' ? gameState.status : 'choosing';

  const allPlayers = [{ id: 'you', name: 'You', color: '#F05A78' }, ...participants];
  const activePlayer = allPlayers[turnIndex % allPlayers.length];
  const currentCard = CHALLENGES[turnIndex % CHALLENGES.length];
  const isMyTurn = activePlayer.name === 'You';

  const handleSelectChoice = (type: 'truth' | 'dare') => {
    onGameStateChange?.({ ...gameState, turnIndex, choice: type, status: 'active' });
  };

  const handleComplete = () => {
    onGameStateChange?.({ ...gameState, turnIndex, choice, status: 'completed' });
    onSendReaction('cheer');
    onSendMessage(`🎉 ${activePlayer.name} completed their ${choice?.toUpperCase()}!`);
  };

  const handlePass = () => {
    onGameStateChange?.({ ...gameState, turnIndex, choice, status: 'passed' });
    onSendMessage(`🛡️ ${activePlayer.name} passed on this challenge. Respect!`);
  };

  const handleNextTurn = () => {
    onGameStateChange?.({ ...gameState, turnIndex: (turnIndex + 1) % allPlayers.length, choice: null, status: 'choosing' });
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Top Banner */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <Flame className="h-3.5 w-3.5" />
            CHALLENGE · {activePlayer.name.toUpperCase()}’S TURN
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Truth or Dare
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs text-[#6F6470]">
          <ShieldAlert className="h-3.5 w-3.5 text-spark-coral" />
          Pass anytime with zero judgment
        </span>
      </div>

      {/* Main Stage */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        {status === 'choosing' && (
          <div className="text-center">
            <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
              TURN: {activePlayer.name.toUpperCase()}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-dark-950 sm:text-4xl">
              Choose your fate.
            </h1>
            <p className="mt-2 text-xs text-[#6F6470] sm:text-sm">
              {isMyTurn ? 'Will you answer a question or take on a challenge?' : `Waiting for ${activePlayer.name} to choose...`}
            </p>

            <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectChoice('truth')}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-dark-950/10 bg-white p-6 transition hover:border-[#3b7d56] hover:bg-[#f4faf6] hover:shadow-lg"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef7f1] text-[#3b7d56] transition group-hover:scale-110">
                  <HelpCircle className="h-6 w-6" />
                </span>
                <span className="text-base font-bold text-dark-950">Truth</span>
                <span className="text-[11px] text-[#6F6470]">Answer honestly</span>
              </button>

              <button
                onClick={() => handleSelectChoice('dare')}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-dark-950/10 bg-white p-6 transition hover:border-spark-coral hover:bg-[#fff0f3] hover:shadow-lg"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3] text-spark-coral transition group-hover:scale-110">
                  <Zap className="h-6 w-6" />
                </span>
                <span className="text-base font-bold text-dark-950">Dare</span>
                <span className="text-[11px] text-[#6F6470]">Take a challenge</span>
              </button>
            </div>
          </div>
        )}

        {(status === 'active' || status === 'completed' || status === 'passed') && (
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-dark-950 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                {choice}
              </span>
              <span className="text-xs text-[#6F6470]">for {activePlayer.name}</span>
            </div>

            <h1 className="mt-4 max-w-4xl text-balance text-[clamp(1.5rem,4.8vw,2.75rem)] font-bold leading-tight tracking-[-0.035em] text-dark-950">
              “{choice === 'truth' ? currentCard.truth : currentCard.dare}”
            </h1>

            {status === 'active' && (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3b7d56] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#2b6142]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed challenge
                </button>

                <button
                  onClick={handlePass}
                  className="inline-flex items-center gap-2 rounded-full border border-dark-950/15 bg-white px-5 py-3 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
                >
                  <XCircle className="h-4 w-4 text-[#6F6470]" />
                  Pass / Opt out
                </button>
              </div>
            )}

            {status === 'completed' && (
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#3b7d56]">
                <Sparkles className="h-5 w-5" />
                Challenge completed! The room is cheering.
              </div>
            )}

            {status === 'passed' && (
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#6F6470]">
                Passed respectfully. Moving on!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          Next player: {allPlayers[(turnIndex + 1) % allPlayers.length].name}
        </span>

        <button
          onClick={handleNextTurn}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>Next turn</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
