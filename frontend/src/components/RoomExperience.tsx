'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useRoomSocket } from '@/lib/use-room-socket';
import { getAccessToken } from '@/lib/auth';
import RoomShell from './room/RoomShell';
import { ExperienceTemplate, RoomParticipant, ReactionKind, RoomEvent } from './room/types';
import OpenConversationStage from './room/activities/OpenConversationStage';
import GuidedConversationStage from './room/activities/GuidedConversationStage';
import DebateStage from './room/activities/DebateStage';
import QuickTakesStage from './room/activities/QuickTakesStage';
import MostLikelyToStage from './room/activities/MostLikelyToStage';
import TruthOrDareStage from './room/activities/TruthOrDareStage';
import GuessMyAnswerStage from './room/activities/GuessMyAnswerStage';
import WordBattleStage from './room/activities/WordBattleStage';
import BuildStoryStage from './room/activities/BuildStoryStage';
import PlanTogetherStage from './room/activities/PlanTogetherStage';
import SharedChallengesStage from './room/activities/SharedChallengesStage';
import DateNightAnywhereStage from './room/activities/DateNightAnywhereStage';

const DEFAULT_PEOPLE: RoomParticipant[] = [
  { id: '1', name: 'Ada', initial: 'A', color: '#281D32', statusLabel: 'Here' },
  { id: '2', name: 'Maya', initial: 'M', color: '#c94f70', statusLabel: 'Speaking', isSpeaking: true },
  { id: '3', name: 'Jon', initial: 'J', color: '#8770a0', statusLabel: 'Listening' },
  { id: '4', name: 'Sam', initial: 'S', color: '#d7953d', statusLabel: 'Here' },
];

type ExperienceMode = 'talk' | 'play' | 'together' | 'plan';

interface RoomExperienceProps {
  roomId: string;
  roomCode: string;
  roomName: string;
  mode?: ExperienceMode;
  alreadyJoined?: boolean;
}

export default function RoomExperience({
  roomId,
  roomCode,
  roomName,
  mode = 'talk',
  alreadyJoined = false,
}: RoomExperienceProps) {
  const [view, setView] = useState<'overview' | 'arrival' | 'live' | 'wrap'>('overview');
  const [seconds, setSeconds] = useState(720);
  const [joined, setJoined] = useState(alreadyJoined);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const seenChatCount = useRef(0);

  const isTalk = mode === 'talk';
  const isPlay = mode === 'play';
  const isTogether = mode === 'together' || mode === 'plan';

  // Initialize template based on mode
  const [template, setTemplate] = useState<ExperienceTemplate>(
    isPlay ? 'most_likely_to' : isTogether ? 'plan_together' : 'open_talk'
  );

  const { connected, events, send } = useRoomSocket(roomId, joined);
  const [previewEvents, setPreviewEvents] = useState<RoomEvent[]>([]);
  const roomEvents = roomId ? events : previewEvents;

  // Together is strictly 2 people (You + 1 Partner)
  const roomParticipants = isTogether ? [DEFAULT_PEOPLE[1]] : DEFAULT_PEOPLE;

  const roomSummary = isTalk
    ? 'A small room for people who want an easier way into an honest conversation.'
    : isPlay
    ? 'A playful shared game room with lively interaction, turns, and laughs.'
    : 'A private shared experience for two people to connect, plan, and share moments.';

  useEffect(() => {
    if (view !== 'live') return;
    const timer = window.setInterval(() => setSeconds((cur) => Math.max(0, cur - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [view]);

  const formattedTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  async function joinRoom() {
    const token = await getAccessToken();
    if (!token) return setJoinError('Sign in to join this room.');
    if (!roomId) return setJoinError('This room is unavailable. Return to Discover and choose another room.');
    setJoining(true);
    setJoinError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/rooms/${encodeURIComponent(roomCode)}/join/`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('This room cannot be joined right now.');
      setJoined(true);
      setView('arrival');
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'This room cannot be joined right now.');
    } finally {
      setJoining(false);
    }
  }

  useEffect(() => {
    const chatCount = roomEvents.filter((ev) => ev.event === 'chat.sent').length;
    const newCount = Math.max(0, chatCount - seenChatCount.current);
    if (newCount > 0 && !chatOpen) setUnreadMessages((count) => count + newCount);
    seenChatCount.current = chatCount;
  }, [roomEvents, chatOpen]);

  function sendChatMessage(text: string) {
    if (!text.trim()) return;
    if (!roomId) {
      setPreviewEvents((cur) => [
        ...cur,
        { event: 'chat.sent', payload: { message: text, actor_name: 'You' } },
      ]);
    }
    send('chat.sent', { message: text });
  }

  function sendReaction(kind: ReactionKind) {
    if (!roomId) {
      setPreviewEvents((cur) => [
        ...cur,
        { event: 'reaction.sent', payload: { kind, actor_name: 'You' } },
      ]);
    }
    send('reaction.sent', { kind });
  }

  function toggleChat() {
    setChatOpen((open) => {
      if (!open) setUnreadMessages(0);
      return !open;
    });
  }

  function handlePromptChat(promptText: string) {
    setChatOpen(true);
    sendChatMessage(promptText);
  }

  // --- 1. OVERVIEW VIEW ---
  if (view === 'overview') {
    return (
      <main className="min-h-screen bg-[#fffdfc] px-5 py-6 text-dark-950 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-5xl">
          <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]">
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </Link>
          <section className="mt-7 overflow-hidden rounded-[32px] bg-dark-950 text-white">
            <div className="grid lg:grid-cols-[1.1fr_.9fr]">
              <div className="p-7 sm:p-10">
                <p className="text-xs font-bold tracking-[.18em] text-spark-rose">
                  {isTalk ? 'OPEN CONVERSATION' : isPlay ? 'SHARED GAME ROOM' : 'SHARED EXPERIENCE'}
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-[-.06em] sm:text-5xl">{roomName}</h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/68">{roomSummary}</p>
                <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/75">
                  <span className="rounded-full border border-white/15 px-3 py-2">4 people</span>
                  <span className="rounded-full border border-white/15 px-3 py-2">12 minutes</span>
                  <span className="rounded-full border border-white/15 px-3 py-2">
                    {isTalk ? 'Thoughtful conversation' : isPlay ? 'Playful game format' : 'Guided activity'}
                  </span>
                </div>
                <button
                  disabled={joining}
                  onClick={() => (joined ? setView('arrival') : joinRoom())}
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white transition hover:bg-spark-flame disabled:cursor-wait disabled:opacity-70"
                >
                  {joining ? 'Joining room…' : joined ? 'Enter room' : 'Join this room'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                {joinError && <p role="alert" className="mt-4 text-sm text-spark-rose">{joinError}</p>}
              </div>

              <div className="bg-[#fff0f3] p-7 text-dark-950 sm:p-10">
                <p className="text-xs font-bold tracking-[.16em] text-spark-coral">HOW IT MOVES</p>
                <ol className="mt-7 space-y-6">
                  <li className="flex gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-spark-coral">1</span>
                    <p className="text-sm leading-6"><b>Arrive as you are.</b><br />There is nothing to prepare or prove.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-spark-coral">2</span>
                    <p className="text-sm leading-6">
                      <b>{isPlay ? 'Jump into the game mechanic.' : 'Follow one good question or topic.'}</b><br />
                      {isPlay ? 'Private voting, turns, dares, or quick battles.' : 'Speak, listen, or take a quiet moment.'}
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-spark-coral">3</span>
                    <p className="text-sm leading-6"><b>Switch anytime.</b><br />Change formats whenever the room wants a new vibe.</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#6F6470]">
            <ShieldCheck className="h-4 w-4" />
            Leave any time. Nothing opens into a private chat unless both people choose it.
          </p>
        </div>
      </main>
    );
  }

  // --- 2. ARRIVAL VIEW ---
  if (view === 'arrival') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950">
        <section className="w-full max-w-lg text-center">
          <Link href="/discover" className="absolute left-5 top-6 inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]">
            <ArrowLeft className="h-4 w-4" />
            Leave room
          </Link>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0f3]">
            <UsersRound className="h-6 w-6 text-spark-coral" />
          </span>
          <p className="mt-7 text-xs font-bold uppercase tracking-widest text-[#6F6470]">{roomName}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-.055em]">You’re in.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6F6470]">
            The room opens once everyone is ready. Choose your starting format below:
          </p>

          {/* Template Choice on Arrival */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-left">
            {isTogether ? (
              <>
                <button
                  onClick={() => setTemplate('plan_together')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'plan_together'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Plan a Date</p>
                  <p className="text-[10px] text-[#6F6470]">Budget, mood & time match</p>
                </button>
                <button
                  onClick={() => setTemplate('shared_challenges')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'shared_challenges'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Shared Challenges</p>
                  <p className="text-[10px] text-[#6F6470]">Connection checklist</p>
                </button>
                <button
                  onClick={() => setTemplate('date_night')}
                  className={`col-span-2 rounded-2xl border p-3 transition ${
                    template === 'date_night'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Date Night Anywhere</p>
                  <p className="text-[10px] text-[#6F6470]">3-chapter journey: play, talk, keepsake</p>
                </button>
              </>
            ) : isPlay ? (
              <>
                <button
                  onClick={() => setTemplate('most_likely_to')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'most_likely_to'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Most Likely To</p>
                  <p className="text-[10px] text-[#6F6470]">Party voting & reveals</p>
                </button>
                <button
                  onClick={() => setTemplate('truth_or_dare')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'truth_or_dare'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Truth or Dare</p>
                  <p className="text-[10px] text-[#6F6470]">Turns & challenges</p>
                </button>
                <button
                  onClick={() => setTemplate('guess_my_answer')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'guess_my_answer'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Guess My Answer</p>
                  <p className="text-[10px] text-[#6F6470]">Predictions & matches</p>
                </button>
                <button
                  onClick={() => setTemplate('word_battle')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'word_battle'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Word Battle</p>
                  <p className="text-[10px] text-[#6F6470]">Quick competitive round</p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTemplate('open_talk')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'open_talk'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Open Conversation</p>
                  <p className="text-[10px] text-[#6F6470]">Spacious editorial topic</p>
                </button>
                <button
                  onClick={() => setTemplate('guided_journey')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'guided_journey'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Guided Journey</p>
                  <p className="text-[10px] text-[#6F6470]">Question-by-question</p>
                </button>
                <button
                  onClick={() => setTemplate('debate')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'debate'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Debate</p>
                  <p className="text-[10px] text-[#6F6470]">Positions & reveals</p>
                </button>
                <button
                  onClick={() => setTemplate('quick_takes')}
                  className={`rounded-2xl border p-3 transition ${
                    template === 'quick_takes'
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white hover:border-dark-950/25'
                  }`}
                >
                  <p className="text-xs font-bold text-dark-950">Quick Takes</p>
                  <p className="text-[10px] text-[#6F6470]">Rapid-fire opinions</p>
                </button>
              </>
            )}
          </div>

          <div className="mt-8 rounded-[28px] border border-dark-950/10 bg-white p-6 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">4 of 4 people are here</p>
              <span className={`text-xs font-semibold ${connected ? 'text-[#4d8568]' : 'text-[#6F6470]'}`}>
                {connected ? '● Live' : '○ Connecting'}
              </span>
            </div>
            <div className="mt-5 flex -space-x-2">
              {DEFAULT_PEOPLE.map((p) => (
                <span
                  key={p.id}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm"
                  style={{ background: p.color }}
                >
                  {p.initial}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              send('room.ready');
              setView('live');
            }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-dark-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-dark-900"
          >
            Enter the room <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>
    );
  }

  // --- 3. WRAP VIEW ---
  if (view === 'wrap') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 py-8 text-dark-950">
        <section className="w-full max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-spark-coral">Room complete</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.06em]">That was {roomName}.</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#6F6470]">
            You shared a small moment. What happens next is entirely up to you.
          </p>
          <Link
            href="/discover"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-dark-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-dark-900"
          >
            Back to rooms <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  // --- 4. LIVE VIEW WITH ROOM SHELL & PLUGGABLE STAGES ---
  return (
    <RoomShell
      roomName={roomName}
      timeRemaining={formattedTime}
      connected={connected}
      participants={DEFAULT_PEOPLE}
      currentTemplate={template}
      onSelectTemplate={setTemplate}
      onReaction={sendReaction}
      onSendMessage={sendChatMessage}
      onEndRoom={() => setView('wrap')}
      events={roomEvents}
      chatOpen={chatOpen}
      onToggleChat={toggleChat}
      unreadCount={unreadMessages}
    >
      {/* Talk Templates */}
      {template === 'open_talk' && (
        <OpenConversationStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'guided_journey' && (
        <GuidedConversationStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'debate' && (
        <DebateStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'quick_takes' && (
        <QuickTakesStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {/* Play Templates */}
      {template === 'most_likely_to' && (
        <MostLikelyToStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'truth_or_dare' && (
        <TruthOrDareStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'guess_my_answer' && (
        <GuessMyAnswerStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'word_battle' && (
        <WordBattleStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'build_a_story' && (
        <BuildStoryStage
          roomName={roomName}
          isHost={true}
          participants={DEFAULT_PEOPLE}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {/* Together Templates (2 People · Invite Only) */}
      {template === 'plan_together' && (
        <PlanTogetherStage
          roomName={roomName}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'shared_challenges' && (
        <SharedChallengesStage
          roomName={roomName}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'date_night' && (
        <DateNightAnywhereStage
          roomName={roomName}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}
    </RoomShell>
  );
}
