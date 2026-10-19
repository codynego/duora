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
  const finished = Boolean(gameState.finished);

  const handleAddSentence = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isMyTurn) return;
    const text = mySentence.trim();
    if (!text) return;

    onGameStateChange?.({ ...gameState, story: [
      ...story,
      {
        author: activePlayer.name,
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
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dark-950/8 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
            <PenTool className="h-3.5 w-3.5" />
            CREATIVE GAME · BUILD A STORY
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            Collaborative storytelling
          </span>
        </div>

        <button
          onClick={handleFinish}
          disabled={!isHost || finished}
          className="text-xs font-bold text-spark-coral hover:underline"
        >
          {finished ? 'Finished story' : 'Review full story'}
        </button>
      </div>

      {/* Main Canvas: The Story So Far */}
      <div className="my-auto flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          THE STORY SO FAR
        </p>

        {/* Scrollable Story Canvas */}
        <div className="mt-3 max-h-[38vh] min-h-[140px] overflow-y-auto rounded-3xl border border-dark-950/8 bg-white/70 p-5 leading-relaxed text-dark-950 shadow-inner sm:p-7">
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
          <form onSubmit={handleAddSentence} className="mt-5 max-w-2xl">
            <label className="block text-xs font-semibold text-[#6F6470]">
              Add the next sentence to continue the story:
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={mySentence}
                onChange={(e) => setMySentence(e.target.value)}
                placeholder="What happens next? Write one sentence..."
                disabled={!isMyTurn}
                className="min-w-0 flex-1 rounded-2xl border border-dark-950/15 bg-white px-4 py-3 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!isMyTurn || !mySentence.trim()}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-dark-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-dark-900 disabled:opacity-40"
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
      <div className="flex shrink-0 items-center justify-between border-t border-dark-950/8 pt-5">
        <span className="text-xs text-[#6F6470]">
          {isMyTurn ? 'Your turn — add one sentence.' : `${activePlayer.name} is writing the next sentence.`}
        </span>

        <button
          onClick={() => {
            onGameStateChange?.({ ...gameState, story: [], finished: false });
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-3.5 py-2 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
        >
          <BookOpen className="h-3.5 w-3.5 text-spark-coral" />
          Start new story
        </button>
      </div>
    </section>
  );
}
