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
import { BaseStageProps, currentPlayerId } from '../types';
import { ADDITIONAL_GUESS_QUESTIONS } from './additional-game-content';

interface GuessQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const BASE_GUESS_QUESTIONS: GuessQuestion[] = [
  {
    id: 'g1',
    question: 'What is {name}’s ideal holiday?',
    options: ['Beach escape', 'Mountain adventure', 'City exploration', 'Quiet countryside cabin'],
    correctAnswer: 'Mountain adventure',
  },
  {
    id: 'g2',
    question: 'What is {name}’s biggest pet peeve?',
    options: ['Loud chewers', 'People walking too slowly', 'Unread notifications badge', 'Passive-aggressive emails'],
    correctAnswer: 'People walking too slowly',
  },
  {
    id: 'g3',
    question: 'What is {name}’s go-to comfort food when stressed?',
    options: ['Spicy ramen', 'Warm chocolate chip cookies', 'Loaded pizza', 'Cheesy pasta'],
    correctAnswer: 'Spicy ramen',
  },
];

const GUESS_QUESTIONS: GuessQuestion[] = [...BASE_GUESS_QUESTIONS, ...ADDITIONAL_GUESS_QUESTIONS];

export default function GuessMyAnswerStage({
  roomId,
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const questionIndex = typeof gameState.questionIndex === 'number' ? gameState.questionIndex : 0;
  const phase = gameState.phase === 'revealed' ? 'revealed' : 'predicting';
  const playerId = currentPlayerId(participants);
  const predictions = (gameState.predictions && typeof gameState.predictions === 'object' ? gameState.predictions : {}) as Record<string, string>;
  const answers = (gameState.answers && typeof gameState.answers === 'object' ? gameState.answers : {}) as Record<string, string>;
  const myPrediction = predictions[playerId] ?? null;

  const currentQ = GUESS_QUESTIONS[questionIndex % GUESS_QUESTIONS.length];
  const targetPlayers = participants.filter((person) => !person.isYou);
  const target = targetPlayers[questionIndex % Math.max(targetPlayers.length, 1)] ?? participants.find((person) => person.isYou) ?? { id: 'you', name: 'You', isYou: true };
  const targetName = target.name;
  const questionText = currentQ.question.replace('{name}', targetName);
  const isTarget = Boolean(target.isYou);
  const actualAnswer = answers[target.id] ?? (!roomId ? currentQ.correctAnswer : null);

  const handleSelectOption = (opt: string) => {
    if (isTarget) {
      onGameStateChange?.({ ...gameState, questionIndex, phase: 'predicting', answers: { ...answers, [target.id]: opt } });
      return;
    }
    onGameStateChange?.({ ...gameState, questionIndex, phase: 'predicting', predictions: { ...predictions, [playerId]: opt } });
  };

  const handleReveal = () => {
    if (!isHost || !actualAnswer) return;
    onGameStateChange?.({ ...gameState, questionIndex, phase: 'revealed' });
  };

  const handleNextRound = () => {
    if (!isHost) return;
    onGameStateChange?.({ ...gameState, questionIndex: (questionIndex + 1) % GUESS_QUESTIONS.length, phase: 'predicting', predictions: {}, answers: {} });
  };

  return (
    <section className="game-stage game-stage--guess flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <UserCheck className="h-3.5 w-3.5" />
            GUESSING GAME · ROUND {questionIndex + 1}
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            {targetName} is in the spotlight
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
          PREDICT {targetName.toUpperCase()}’S ANSWER
        </p>

        <h1 className="mt-2.5 max-w-4xl text-balance text-[clamp(1.5rem,4.6vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] text-dark-950">
          “{questionText}”
        </h1>

        <p className="mt-2 text-xs text-[#6F6470]">
          {isTarget
            ? 'You are in the spotlight! Choose your true answer below.'
            : `Predict what ${targetName} would choose before everyone reveals.`}
        </p>

        {/* Option Grid */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {currentQ.options.map((option) => {
            const isSelected = isTarget ? actualAnswer === option : myPrediction === option;
            const isCorrect = phase === 'revealed' && option === actualAnswer;
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
          <div className="mt-6 flex items-center justify-between gap-3 text-xs text-[#6F6470]">
            <span>
              {isTarget
                ? actualAnswer ? 'Your true answer is locked in.' : 'Choose your true answer.'
                : myPrediction ? 'Your prediction is locked in.' : 'Choose an option to lock in.'}
            </span>

            <button
              onClick={handleReveal}
              disabled={!isHost || !actualAnswer}
              className="font-bold text-spark-coral hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isHost ? 'Reveal answer & matches →' : 'Waiting for the host to reveal →'}
            </button>
          </div>
        )}

        {/* Phase 2: Matches Revealed */}
        {phase === 'revealed' && (
          <div className="mt-6 rounded-2xl bg-[#fffdfc] border border-dark-950/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-dark-950/60">
              Who knew {targetName} best?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(predictions).map(([player, guess]) => {
                const matched = guess === actualAnswer;
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
                    {participants.find((person) => person.id === player)?.name ?? player}: {guess}
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
          disabled={!isHost}
          className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900"
        >
          <span>{isHost ? 'Next person' : 'Host controls next person'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
