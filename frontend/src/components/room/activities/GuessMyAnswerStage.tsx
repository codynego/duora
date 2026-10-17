'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Eye,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface GuessQuestion {
  id: string;
  targetName: string;
  question: string;
  options: string[];
  correctAnswer: string;
  mockPredictions: Record<string, string>; // playerName -> predictedOption
}

const GUESS_QUESTIONS: GuessQuestion[] = [
  {
    id: 'g1',
    targetName: 'Alex',
    question: 'What is Alex’s ideal holiday?',
    options: ['Beach escape', 'Mountain adventure', 'City exploration', 'Quiet countryside cabin'],
    correctAnswer: 'Mountain adventure',
    mockPredictions: {
      Maya: 'Beach escape',
      Jon: 'Mountain adventure',
      Sam: 'Mountain adventure',
    },
  },
  {
    id: 'g2',
    targetName: 'Maya',
    question: 'What is Maya’s biggest pet peeve?',
    options: ['Loud chewers', 'People walking too slowly', 'Unread notifications badge', 'Passive-aggressive emails'],
    correctAnswer: 'People walking too slowly',
    mockPredictions: {
      Alex: 'People walking too slowly',
      Jon: 'Loud chewers',
      Sam: 'People walking too slowly',
    },
  },
  {
    id: 'g3',
    targetName: 'You',
    question: 'What is Your go-to comfort food when stressed?',
    options: ['Spicy ramen', 'Warm chocolate chip cookies', 'Loaded pizza', 'Cheesy pasta'],
    correctAnswer: 'Spicy ramen',
    mockPredictions: {
      Alex: 'Loaded pizza',
      Maya: 'Spicy ramen',
      Jon: 'Spicy ramen',
      Sam: 'Cheesy pasta',
    },
  },
];

export default function GuessMyAnswerStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
}: BaseStageProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<'predicting' | 'revealed'>('predicting');
  const [myPrediction, setMyPrediction] = useState<string | null>(null);

  const currentQ = GUESS_QUESTIONS[questionIndex % GUESS_QUESTIONS.length];
  const isTarget = currentQ.targetName === 'You';

  const handleSelectOption = (opt: string) => {
    setMyPrediction(opt);
  };

  const handleReveal = () => {
    setPhase('revealed');
  };

  const handleNextRound = () => {
    setQuestionIndex((prev) => (prev + 1) % GUESS_QUESTIONS.length);
    setPhase('predicting');
    setMyPrediction(null);
  };

  const allPredictions: Record<string, string> = {
    ...currentQ.mockPredictions,
    ...(myPrediction && !isTarget ? { You: myPrediction } : {}),
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <UserCheck className="h-3.5 w-3.5" />
            GUESSING GAME · ROUND {questionIndex + 1}
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            {currentQ.targetName} is in the spotlight
          </span>
        </div>

        <div>
          {phase === 'predicting' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6470]">
              <Lock className="h-3.5 w-3.5 text-spark-coral" />
              Predictions hidden
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b7d56]">
              <Eye className="h-3.5 w-3.5" />
              Answer revealed
            </span>
          )}
        </div>
      </div>

      {/* Main Game Card */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          PREDICT {currentQ.targetName.toUpperCase()}’S ANSWER
        </p>

        <h1 className="mt-2.5 max-w-4xl text-balance text-[clamp(1.5rem,4.6vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] text-dark-950">
          “{currentQ.question}”
        </h1>

        <p className="mt-2 text-xs text-[#6F6470]">
          {isTarget
            ? 'You are in the spotlight! Choose your true answer below.'
            : `Predict what ${currentQ.targetName} would choose before everyone reveals.`}
        </p>

        {/* Option Grid */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {currentQ.options.map((option) => {
            const isSelected = myPrediction === option;
            const isCorrect = phase === 'revealed' && option === currentQ.correctAnswer;
            const isWrongGuess = phase === 'revealed' && isSelected && !isCorrect;

            return (
              <button
                key={option}
                disabled={phase === 'revealed'}
                onClick={() => handleSelectOption(option)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  isCorrect
                    ? 'border-[#3b7d56] bg-[#eef7f1] text-[#2b6142] ring-2 ring-[#3b7d56]'
                    : isWrongGuess
                    ? 'border-spark-coral bg-[#fff0f3] text-spark-coral'
                    : isSelected
                    ? 'border-spark-coral bg-[#fff0f3] ring-2 ring-spark-coral'
                    : 'border-dark-950/10 bg-white hover:border-dark-950/30'
                }`}
              >
                <span className="text-xs font-bold sm:text-sm">{option}</span>
                {isCorrect && (
                  <span className="flex items-center gap-1 rounded-full bg-[#3b7d56] px-2.5 py-1 text-[10px] font-bold text-white">
                    <Check className="h-3 w-3" />
                    Real answer
                  </span>
                )}
                {isWrongGuess && (
                  <span className="flex items-center gap-1 rounded-full bg-spark-coral px-2.5 py-1 text-[10px] font-bold text-white">
                    <X className="h-3 w-3" />
                    Your guess
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Phase 1: Action Prompt */}
        {phase === 'predicting' && (
          <div className="mt-6 flex items-center justify-between text-xs text-[#6F6470]">
            <span>
              {myPrediction
                ? isTarget
                  ? 'Your true answer is locked in.'
                  : 'Your prediction is locked in.'
                : 'Choose an option to lock in.'}
            </span>

            <button
              onClick={handleReveal}
              className="font-bold text-spark-coral hover:underline"
            >
              Reveal answer & matches →
            </button>
          </div>
        )}

        {/* Phase 2: Matches Revealed */}
        {phase === 'revealed' && (
          <div className="mt-6 rounded-2xl bg-[#fffdfc] border border-dark-950/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-dark-950/60">
              Who knew {currentQ.targetName} best?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(allPredictions).map(([player, guess]) => {
                const matched = guess === currentQ.correctAnswer;
                return (
                  <span
                    key={player}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      matched
                        ? 'bg-[#eef7f1] text-[#2b6142]'
                        : 'bg-dark-950/5 text-[#6F6470]'
                    }`}
                  >
                    {matched ? <Check className="h-3.5 w-3.5 text-[#3b7d56]" /> : <X className="h-3.5 w-3.5 text-[#6F6470]" />}
                    {player}: {guess}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          Predict first. Reveal together.
        </span>

        <button
          onClick={handleNextRound}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>Next person</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
