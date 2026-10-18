'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, Timer, Zap } from 'lucide-react';
import { BaseStageProps, RoomParticipant } from '../types';

interface WordChallenge {
  id: string;
  category: string;
  letter: string;
  prompt: string;
}

const TURN_SECONDS = 10;
const WORD_CHALLENGES: WordChallenge[] = [
  { id: 'w1', category: 'Fruit', letter: 'M', prompt: 'Name a fruit beginning with M' },
  { id: 'w2', category: 'City', letter: 'P', prompt: 'Name a major world city beginning with P' },
  { id: 'w3', category: 'Animal', letter: 'O', prompt: 'Name an animal beginning with O' },
];

export default function WordBattleStage({
  participants,
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const round = typeof gameState.round === 'number' ? gameState.round : 0;
  const turnIndex = typeof gameState.turnIndex === 'number' ? gameState.turnIndex : 0;
  const turnStartedAt = typeof gameState.turnStartedAt === 'number' ? gameState.turnStartedAt : null;
  const [myAnswer, setMyAnswer] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const advancedTurn = useRef(false);

  const roster: RoomParticipant[] = participants.length
    ? participants
    : [{ id: 'you', name: 'You', initial: 'Y', color: '#F05A78', isYou: true }];
  const activePlayer = roster[turnIndex % roster.length];
  const isMyTurn = Boolean(activePlayer.isYou);
  const current = WORD_CHALLENGES[round % WORD_CHALLENGES.length];
  const scores = (gameState.scores as Record<string, number> | undefined) ?? {};
  const secondsLeft = turnStartedAt
    ? Math.max(0, TURN_SECONDS - Math.floor((now - turnStartedAt) / 1000))
    : TURN_SECONDS;
  const feedback = typeof gameState.feedback === 'string' ? gameState.feedback : localFeedback;

  useEffect(() => {
    if (turnStartedAt || !onGameStateChange) return;
    onGameStateChange({ ...gameState, round, turnIndex: 0, turnStartedAt: Date.now(), scores: {} });
  }, [gameState, onGameStateChange, round, turnStartedAt]);

  useEffect(() => {
    if (!turnStartedAt) return;
    advancedTurn.current = false;
    const timer = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick - turnStartedAt >= TURN_SECONDS * 1000 && isMyTurn && !advancedTurn.current) {
        advancedTurn.current = true;
        onGameStateChange?.({
          ...gameState,
          round: round + 1,
          turnIndex: (turnIndex + 1) % roster.length,
          turnStartedAt: tick,
          feedback: `${activePlayer.name}'s turn is over.`,
        });
        setMyAnswer('');
        setLocalFeedback(null);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [activePlayer.name, gameState, isMyTurn, onGameStateChange, roster.length, round, turnIndex, turnStartedAt]);

  function advanceTurn() {
    if (!isMyTurn || !onGameStateChange) return;
    const nextStartedAt = Date.now();
    onGameStateChange({ ...gameState, round: round + 1, turnIndex: (turnIndex + 1) % roster.length, turnStartedAt: nextStartedAt, feedback: `${activePlayer.name} passed the turn.` });
    setMyAnswer('');
    setLocalFeedback(null);
  }

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    if (!isMyTurn || secondsLeft === 0) return;
    const answer = myAnswer.trim();
    if (!answer) return;
    if (!answer.toLowerCase().startsWith(current.letter.toLowerCase()) || answer.length <= 2) {
      setLocalFeedback(`Must start with “${current.letter}”. Try another!`);
      return;
    }
    const nextScores = { ...scores, [activePlayer.id]: (scores[activePlayer.id] ?? 0) + 30 };
    onGameStateChange?.({ ...gameState, scores: nextScores, feedback: `${activePlayer.name} scored 30 points with “${answer}”!` });
    setLocalFeedback(`+30 points for “${answer}”!`);
    setMyAnswer('');
    onSendReaction('cheer');
    onSendMessage(`⚡ Word Battle: ${activePlayer.name} scored with “${answer}” (+30 pts)`);
  }

  return (
    <section className="flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral"><Zap className="h-3.5 w-3.5" />WORD BATTLE · ROUND {round + 1}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${secondsLeft <= 3 ? 'bg-[#fff0f3] text-spark-coral' : 'bg-dark-950/8 text-dark-950'}`}><Timer className="h-3.5 w-3.5" />{secondsLeft}s</span>
      </div>

      <div className="flex w-full max-w-4xl flex-none flex-col justify-center py-8 text-center sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">{activePlayer.isYou ? 'YOUR TURN' : `${activePlayer.name.toUpperCase()}'S TURN`} · CATEGORY: {current.category.toUpperCase()}</p>
        <h1 className="mx-auto mt-3 max-w-3xl break-words text-pretty text-[clamp(1.7rem,4.4vw,2.9rem)] font-bold leading-[1.12] tracking-[-0.035em] text-dark-950">“{current.prompt}”</h1>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-[#6F6470]">{activePlayer.isYou ? 'You have ten seconds. Give one answer, then pass the turn.' : `${activePlayer.name} is playing. Watch the clock and get ready.`}</p>

        <form onSubmit={handleSubmit} className="mx-auto mt-7 flex w-full max-w-md gap-2">
          <input type="text" value={myAnswer} onChange={(event) => setMyAnswer(event.target.value)} placeholder={activePlayer.isYou ? `Enter a ${current.category.toLowerCase()}...` : 'Waiting for their answer...'} disabled={!isMyTurn || secondsLeft === 0} autoFocus={isMyTurn} className="min-w-0 flex-1 rounded-full border border-dark-950/15 bg-white px-5 py-3 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 disabled:bg-dark-950/5 sm:text-sm" />
          <button type="submit" disabled={!isMyTurn || secondsLeft === 0 || !myAnswer.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-spark-coral text-white transition hover:bg-spark-flame disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </form>
        {feedback && <p className="mt-3 text-xs font-bold text-spark-coral animate-fadeIn">{feedback}</p>}
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-4 pt-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {roster.map((person) => <div key={person.id} className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs ${person.id === activePlayer.id ? 'bg-[#fff0f3] text-spark-coral' : 'bg-dark-950/5 text-dark-950/70'}`}><span className="flex min-w-0 items-center gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: person.color }}>{person.initial}</span><span className="truncate">{person.isYou ? 'You' : person.name}</span></span><span className="font-bold">{scores[person.id] ?? 0}</span></div>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-[#6F6470]">Every player gets 10 seconds.</span><button onClick={advanceTurn} disabled={!isMyTurn} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-dark-900 disabled:cursor-not-allowed disabled:opacity-40"><span>Pass turn</span><ArrowRight className="h-4 w-4" /></button></div>
      </div>
    </section>
  );
}
