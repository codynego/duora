'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Send,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface StoryContribution {
  author: string;
  sentence: string;
  color: string;
}

export default function BuildStoryStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onSendReaction,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const story = Array.isArray(gameState.story) ? gameState.story as StoryContribution[] : [];
  const turnIndex = typeof gameState.turnIndex === 'number' ? gameState.turnIndex : 0;
  const players = participants.length ? participants : [{ id: 'you', name: 'You', initial: 'Y', color: '#F05A78', isYou: true }];
  const activePlayer = players[turnIndex % players.length];
  const isMyTurn = Boolean(activePlayer.isYou);
  const [mySentence, setMySentence] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const finished = Boolean(gameState.finished);

  const handleAddSentence = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isMyTurn) return;
    const text = mySentence.trim();
    if (!text) return;

    onGameStateChange?.({ ...gameState, story: [
      ...story,
      {
        author: activePlayer.accountName ?? activePlayer.name,
        sentence: text,
        color: activePlayer.color,
      },
    ], turnIndex: (turnIndex + 1) % players.length });
    setMySentence('');
    onSendReaction('support');
    onSendMessage(`✍️ Added to story: “${text}”`);
  };

  const handleFinish = () => {
    if (!isHost) return;
    onGameStateChange?.({ ...gameState, story, finished: true });
    onSendReaction('cheer');
  };

  return (
    <section className="game-stage game-stage--story flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-[#fffdfa] p-6 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-9 lg:p-11">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-dark-950/8 pb-4 sm:items-center sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex min-w-0 max-w-[calc(100vw-9rem)] items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral sm:max-w-none">
            <PenTool className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">CREATIVE GAME · BUILD A STORY</span>
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Collaborative storytelling
          </span>
        </div>

        <button
          onClick={() => {
            if (!finished) setReviewing(true);
          }}
          disabled={!isHost || finished}
          className="shrink-0 whitespace-nowrap pt-1 text-xs font-bold text-spark-coral hover:underline sm:pt-0"
        >
          {finished ? 'Finished story' : 'Review full story'}
        </button>
      </div>

      {reviewing && !finished && (
        <div className="fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#fffdf9] px-5 pb-[env(safe-area-inset-bottom)] pt-8 text-dark-950 sm:px-10 sm:pt-12">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
            <div className="flex flex-col gap-4 border-b border-dark-950/10 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-spark-coral">FULL STORY</p>
                <h2 className="mt-2 break-words text-3xl font-bold tracking-[-.05em] sm:text-5xl">{roomName}</h2>
              </div>
              <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button type="button" onClick={() => { handleFinish(); setReviewing(false); }} className="inline-flex w-full items-center justify-center rounded-full bg-dark-950 px-4 py-2.5 text-xs font-bold text-white sm:w-auto sm:min-w-44">
                  Finish and continue <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button type="button" onClick={() => setReviewing(false)} className="w-full rounded-full border border-dark-950/15 px-4 py-2.5 text-xs font-bold text-dark-950 sm:w-auto">
                  Keep writing
                </button>
              </div>
            </div>
            <article className="my-6 min-h-0 flex-1 overflow-y-auto rounded-[30px] border border-dark-950/10 bg-white p-6 text-lg leading-[1.9] shadow-[0_18px_55px_rgba(40,29,50,.08)] sm:my-8 sm:p-10 sm:text-2xl">
              {story.length ? story.map((chunk, idx) => (
                <span key={`${chunk.author}-${idx}`} className="mr-2 inline">
                  <span className="font-serif">{chunk.sentence}</span>{' '}
                  <span className="inline-block rounded-full px-2.5 py-1 align-middle text-xs font-bold text-white" style={{ background: chunk.color }}>
                    {chunk.author}
                  </span>{' '}
                </span>
              )) : <p className="text-base text-[#6F6470] sm:text-lg">The story is still waiting for its first sentence.</p>}
            </article>
          </div>
        </div>
      )}

      {/* Main Canvas: The Story So Far */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          THE STORY SO FAR
        </p>

        {/* Scrollable Story Canvas */}
        <div className="mt-3 max-h-[30vh] min-h-[140px] overflow-y-auto rounded-3xl border border-dark-950/8 bg-white/70 p-4 leading-relaxed text-dark-950 shadow-inner sm:max-h-[38vh] sm:p-7">
          <p className="text-sm sm:text-base leading-relaxed">
            {story.map((chunk, idx) => (
              <span key={idx} className="mr-2 inline">
                <span className="font-serif text-dark-950">{chunk.sentence}</span>{' '}
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-xs"
                  style={{ background: chunk.color }}
                >
                  {chunk.author}
                </span>{' '}
              </span>
            ))}
          </p>
        </div>

        {/* Contribution Input */}
        {!finished ? (
          <form onSubmit={handleAddSentence} className="relative z-20 mt-5 max-w-2xl">
            <label className="block text-xs font-semibold text-[#6F6470]">
              Add the next sentence to continue the story:
            </label>
            {!isMyTurn && <p className="mt-1 text-xs font-semibold text-spark-coral">{activePlayer.name} is writing the next sentence. Your turn comes next.</p>}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={mySentence}
                onChange={(e) => setMySentence(e.target.value)}
                placeholder={isMyTurn ? 'What happens next? Write one sentence...' : `${activePlayer.name} is writing...`}
                disabled={finished || !isMyTurn}
                className="relative z-20 min-w-0 flex-1 cursor-text rounded-2xl border border-dark-950/15 bg-white px-4 py-3 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 disabled:bg-dark-950/5 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!isMyTurn || !mySentence.trim()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-dark-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-dark-900 disabled:opacity-40 sm:w-auto"
              >
                <span>Add</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#eef7f1] p-4 text-xs font-semibold text-[#2b6142]">
            🎉 Story complete! You created a one-of-a-kind narrative together.
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 flex-col items-stretch gap-3 border-t border-dark-950/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-[#6F6470]">
          {isMyTurn ? 'Your turn — add one sentence.' : `${activePlayer.name} is writing the next sentence.`}
        </span>

        <button
          onClick={() => {
            if (!isHost) return;
            onGameStateChange?.({ ...gameState, story: [], finished: false });
          }}
          disabled={!isHost}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-3.5 py-2 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
        >
          <BookOpen className="h-3.5 w-3.5 text-spark-coral" />
          {isHost ? 'Start new story' : 'Host controls new story'}
        </button>
      </div>
    </section>
  );
}
