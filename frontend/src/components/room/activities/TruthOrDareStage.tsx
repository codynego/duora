'use client';

import React from 'react';
import {
  Flame,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Zap,
  PenLine,
} from 'lucide-react';
import { BaseStageProps } from '../types';
import { ADDITIONAL_ADULT_CHALLENGES, ADDITIONAL_BOLD_ADULT_CHALLENGES, ADDITIONAL_SUPER_BOLD_ADULT_CHALLENGES, ADDITIONAL_TRUTH_CHALLENGES } from './additional-game-content';
import { shuffledDeck } from './prompt-deck';

interface ChallengeCard {
  id: string;
  truth: string;
  dare: string;
}

const BASE_CHALLENGES: ChallengeCard[] = [
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

const CHALLENGES: ChallengeCard[] = [...BASE_CHALLENGES, ...ADDITIONAL_TRUTH_CHALLENGES];

const BASE_ADULT_CHALLENGES: ChallengeCard[] = [
  { id: 'a1', truth: 'What is your biggest turn-on, and how clearly do you communicate it?', dare: 'Give someone in the room a genuinely flirty compliment, only if everyone involved is comfortable.' },
  { id: 'a2', truth: 'What boundary or desire do you wish people asked about more directly?', dare: 'Read a consensual, flirty message you would send to someone you are attracted to.' },
  { id: 'a3', truth: 'What makes you feel desired and respected at the same time?', dare: 'Describe your ideal romantic or intimate atmosphere without naming a specific person.' },
];

const ADULT_CHALLENGES: ChallengeCard[] = [...BASE_ADULT_CHALLENGES, ...ADDITIONAL_ADULT_CHALLENGES];
const BOLD_ADULT_CHALLENGES: ChallengeCard[] = [...ADDITIONAL_BOLD_ADULT_CHALLENGES];
const SUPER_BOLD_ADULT_CHALLENGES: ChallengeCard[] = [...ADDITIONAL_SUPER_BOLD_ADULT_CHALLENGES];

export default function TruthOrDareStage({
  roomName,
  isHost,
  participants,
  audience = 'adults',
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const turnIndex = typeof gameState.turnIndex === 'number' ? gameState.turnIndex : 0;
  const cardIndex = typeof gameState.cardIndex === 'number' ? gameState.cardIndex : 0;
  const choice = gameState.choice === 'truth' || gameState.choice === 'dare' ? gameState.choice : null;
  const status = gameState.status === 'active' || gameState.status === 'awaiting_custom' || gameState.status === 'completed' || gameState.status === 'passed' ? gameState.status : 'choosing';
  const questionMode = gameState.questionMode === 'custom' || gameState.questionMode === 'adult' || gameState.questionMode === 'bold' || gameState.questionMode === 'super_bold' ? gameState.questionMode : 'system';
  const customQuestion = typeof gameState.customQuestion === 'string' ? gameState.customQuestion : '';
  const [customQuestionInput, setCustomQuestionInput] = React.useState(customQuestion);
  const deckSeed = typeof gameState.truthDareSeed === 'number' ? gameState.truthDareSeed : 1;

    const allPlayers = participants.length ? participants : [{ id: 'you', name: 'You', color: '#7454A6', isYou: true }];
  const activePlayer = allPlayers[turnIndex % allPlayers.length];
  const promptSetter = allPlayers[(turnIndex + 1) % allPlayers.length];
  const systemDeck = React.useMemo(() => shuffledDeck(CHALLENGES, deckSeed), [deckSeed]);
  const adultDeck = React.useMemo(() => shuffledDeck(ADULT_CHALLENGES, deckSeed), [deckSeed]);
  const boldDeck = React.useMemo(() => shuffledDeck(BOLD_ADULT_CHALLENGES, deckSeed), [deckSeed]);
  const superBoldDeck = React.useMemo(() => shuffledDeck(SUPER_BOLD_ADULT_CHALLENGES, deckSeed), [deckSeed]);
  const currentCard = questionMode === 'super_bold' && audience === 'adults'
    ? superBoldDeck[cardIndex % superBoldDeck.length]
    : questionMode === 'bold' && audience === 'adults'
    ? boldDeck[cardIndex % boldDeck.length]
    : questionMode === 'adult' && audience === 'adults'
    ? adultDeck[cardIndex % adultDeck.length]
    : systemDeck[cardIndex % systemDeck.length];
  const isMyTurn = Boolean(activePlayer.isYou);
  const canSetPrompt = Boolean(promptSetter.isYou);
  const activePrompt = questionMode === 'custom' && customQuestion ? customQuestion : choice === 'truth' ? currentCard.truth : currentCard.dare;

  React.useEffect(() => {
    if (isHost && typeof gameState.truthDareSeed !== 'number') {
      onGameStateChange?.({ ...gameState, truthDareSeed: Date.now() });
    }
  }, [gameState, isHost, onGameStateChange]);

  const handleQuestionMode = (mode: 'system' | 'custom' | 'adult' | 'bold' | 'super_bold') => {
    if (!canSetPrompt || ((mode === 'adult' || mode === 'bold' || mode === 'super_bold') && audience !== 'adults')) return;
    onGameStateChange?.({ ...gameState, turnIndex, questionMode: mode, customQuestion: mode === 'custom' ? customQuestionInput.trim() : '' });
  };

  const handleSelectChoice = (type: 'truth' | 'dare') => {
    if (!isMyTurn) return;
    onGameStateChange?.({ ...gameState, turnIndex, choice: type, status: questionMode === 'custom' ? 'awaiting_custom' : 'active', questionMode, customQuestion: '' });
  };

  const handleCustomPrompt = () => {
    if (!canSetPrompt || !customQuestionInput.trim() || !choice) return;
    onGameStateChange?.({ ...gameState, turnIndex, choice, status: 'active', questionMode: 'custom', customQuestion: customQuestionInput.trim() });
  };

  const handleComplete = () => {
    if (!isMyTurn) return;
    onGameStateChange?.({ ...gameState, turnIndex, choice, status: 'completed' });
    onSendReaction('cheer');
    onSendMessage(`🎉 ${activePlayer.name} completed their ${choice?.toUpperCase()}!`);
    window.setTimeout(() => onGameStateChange?.({ ...gameState, cardIndex: cardIndex + 1, turnIndex: (turnIndex + 1) % allPlayers.length, choice: null, status: 'choosing', questionMode: questionMode === 'adult' ? 'adult' : questionMode === 'bold' ? 'bold' : questionMode === 'super_bold' ? 'super_bold' : 'system', customQuestion: '' }), 700);
  };

  const handlePass = () => {
    if (!isMyTurn) return;
    onGameStateChange?.({ ...gameState, turnIndex, choice, status: 'passed' });
    onSendMessage(`🛡️ ${activePlayer.name} passed on this challenge. Respect!`);
    window.setTimeout(() => onGameStateChange?.({ ...gameState, cardIndex: cardIndex + 1, turnIndex: (turnIndex + 1) % allPlayers.length, choice: null, status: 'choosing', questionMode: questionMode === 'adult' ? 'adult' : questionMode === 'bold' ? 'bold' : questionMode === 'super_bold' ? 'super_bold' : 'system', customQuestion: '' }), 700);
  };

  return (
    <section className="game-stage game-stage--truth flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
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
              {isMyTurn ? 'Choose truth or dare.' : `${activePlayer.name} is choosing truth or dare.`}
            </p>

            <details className="mx-auto mt-5 max-w-xl rounded-2xl border border-dark-950/10 bg-white/70 text-left">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-dark-950 [&::-webkit-details-marker]:hidden">
                <span>Prompt options</span>
                <span className="text-[10px] font-semibold text-spark-coral">
                  {questionMode === 'system' ? 'Curated question' : questionMode === 'custom' ? 'Your question' : questionMode === 'super_bold' ? '18+ super bold' : questionMode === 'bold' ? '18+ bold' : '18+ warm'}
                </span>
              </summary>
              <div className="border-t border-dark-950/8 p-3">
                <p className="mb-2 text-[10px] font-semibold leading-4 text-[#6F6470]">{canSetPrompt ? `Choose how ${activePlayer.name} receives their prompt.` : `${promptSetter.name} chooses the prompt source for this turn.`}</p>
                <div className="grid gap-2 sm:grid-cols-5">
                  <button type="button" disabled={!canSetPrompt} onClick={() => handleQuestionMode('system')} className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${questionMode === 'system' ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/10 bg-white'}`}>System prompt<span className="mt-1 block text-[10px] font-normal leading-4 text-[#6F6470]">Curated question</span></button>
                  <button type="button" disabled={!canSetPrompt} onClick={() => handleQuestionMode('custom')} className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${questionMode === 'custom' ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/10 bg-white'}`}><PenLine className="mr-1 inline h-3 w-3" />Custom question<span className="mt-1 block text-[10px] font-normal leading-4 text-[#6F6470]">Ask {activePlayer.name}</span></button>
                  <button type="button" disabled={!canSetPrompt || audience !== 'adults'} onClick={() => handleQuestionMode('adult')} className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${questionMode === 'adult' ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/10 bg-white'} disabled:cursor-not-allowed disabled:opacity-40`}>18+ warm<span className="mt-1 block text-[10px] font-normal leading-4 text-[#6F6470]">Flirty & thoughtful</span></button>
                  <button type="button" disabled={!canSetPrompt || audience !== 'adults'} onClick={() => handleQuestionMode('bold')} className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${questionMode === 'bold' ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/10 bg-white'} disabled:cursor-not-allowed disabled:opacity-40`}>18+ bold<span className="mt-1 block text-[10px] font-normal leading-4 text-[#6F6470]">Direct, consensual</span></button>
                  <button type="button" disabled={!canSetPrompt || audience !== 'adults'} onClick={() => handleQuestionMode('super_bold')} className={`min-w-0 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${questionMode === 'super_bold' ? 'border-spark-coral bg-[#fff0f3] text-spark-coral' : 'border-dark-950/10 bg-white'} disabled:cursor-not-allowed disabled:opacity-40`}>Super bold<span className="mt-1 block text-[10px] font-normal leading-4 text-[#6F6470]">Most direct</span></button>
                </div>
                {audience === 'all' && <p className="mt-2 text-[10px] leading-4 text-[#6F6470]">This room is open to everyone, so 18+ prompts are unavailable.</p>}
              </div>
            </details>

            <div className="mx-auto mt-6 grid w-full max-w-md grid-cols-2 gap-3 sm:mt-7 sm:gap-4">
              <button
                disabled={!isMyTurn}
                onClick={() => handleSelectChoice('truth')}
                className="group flex min-h-[154px] flex-col items-center justify-center gap-3 rounded-3xl border border-dark-950/10 bg-white p-4 transition hover:border-[#3b7d56] hover:bg-[#f4faf6] hover:shadow-lg sm:min-h-0 sm:p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef7f1] text-[#3b7d56] transition group-hover:scale-110">
                  <HelpCircle className="h-6 w-6" />
                </span>
                <span className="text-base font-bold text-dark-950">Truth</span>
                <span className="text-[11px] text-[#6F6470]">Choose truth</span>
              </button>

              <button
                disabled={!isMyTurn}
                onClick={() => handleSelectChoice('dare')}
                className="group flex min-h-[154px] flex-col items-center justify-center gap-3 rounded-3xl border border-dark-950/10 bg-white p-4 transition hover:border-spark-coral hover:bg-[#fff0f3] hover:shadow-lg sm:min-h-0 sm:p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3] text-spark-coral transition group-hover:scale-110">
                  <Zap className="h-6 w-6" />
                </span>
                <span className="text-base font-bold text-dark-950">Dare</span>
                <span className="text-[11px] text-[#6F6470]">Choose dare</span>
              </button>
            </div>
          </div>
        )}

        {status === 'awaiting_custom' && (
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-dark-950/10 bg-white p-5 text-left shadow-sm sm:p-7">
            <p className="text-[11px] font-bold tracking-[0.16em] text-spark-coral">CUSTOM {choice?.toUpperCase()} FOR {activePlayer.name.toUpperCase()}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-.045em] text-dark-950">{canSetPrompt ? `Your turn to set ${activePlayer.name}’s ${choice}.` : `${promptSetter.name} is setting ${activePlayer.name}’s ${choice}.`}</h1>
            <p className="mt-2 text-sm leading-6 text-[#6F6470]">{canSetPrompt ? 'Write one clear, considerate prompt. It will appear only when you send it.' : 'The challenge will appear as soon as it is ready.'}</p>
            {canSetPrompt && <><textarea value={customQuestionInput} onChange={(event) => setCustomQuestionInput(event.target.value)} maxLength={240} placeholder={choice === 'truth' ? `Ask ${activePlayer.name} a truth question…` : `Give ${activePlayer.name} a dare…`} className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-dark-950/15 bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-spark-coral" /><div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-[#6F6470]">{customQuestionInput.length}/240</span><button type="button" disabled={!customQuestionInput.trim()} onClick={handleCustomPrompt} className="rounded-full bg-dark-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-dark-950/85 disabled:cursor-not-allowed disabled:opacity-45">Send {choice}</button></div></>}
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
              “{activePrompt}”
            </h1>

            {status === 'active' && (
              <div className="mt-7 grid gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  disabled={!isMyTurn}
                  onClick={handleComplete}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b7d56] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#2b6142]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed challenge
                </button>

                <button
                  disabled={!isMyTurn}
                  onClick={handlePass}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-dark-950/15 bg-white px-5 py-3 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
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
      <div className="flex shrink-0 flex-col items-stretch gap-3 border-t border-dark-950/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-[#6F6470]">
          Next player: {allPlayers[(turnIndex + 1) % allPlayers.length].name}
        </span>

      </div>
    </section>
  );
}
