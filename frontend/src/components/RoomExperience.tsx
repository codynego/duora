'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useRoomActivity } from '@/lib/use-room-activity';
import { getAccessToken } from '@/lib/auth';
import { useRoomGameState } from '@/lib/use-room-game-state';
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

const DEFAULT_TALK_ROOM_NAMES = new Set(['Open Conversation', 'Guided Conversation', 'Debate', 'Quick Takes']);

type ExperienceMode = 'talk' | 'play' | 'flirt' | 'create' | 'together' | 'plan';

interface RoomExperienceProps {
  roomId: string;
  roomCode: string;
  roomName: string;
  mode?: ExperienceMode;
  audience?: 'adults' | 'all';
  alreadyJoined?: boolean;
  experience?: string;
  startsAt?: string;
  durationMinutes?: number;
}

function templateForExperience(experience?: string): ExperienceTemplate {
  const templates: Record<string, ExperienceTemplate> = {
    'open-conversation': 'open_talk',
    'guided-conversation': 'guided_journey',
    debate: 'debate',
    'quick-takes': 'quick_takes',
    'most-likely-to': 'most_likely_to',
    'truth-or-dare': 'truth_or_dare',
    'guess-my-answer': 'guess_my_answer',
    'word-battle': 'word_battle',
    'build-a-story': 'build_a_story',
    'plan-something-together': 'plan_together',
    'shared-challenges': 'shared_challenges',
    'date-night-anywhere': 'date_night',
  };
  return templates[experience ?? ''] ?? 'open_talk';
}

export default function RoomExperience({
  roomId,
  roomCode,
  roomName,
  mode = 'talk',
  audience = 'adults',
  alreadyJoined = false,
  experience,
  startsAt,
  durationMinutes = 12,
}: RoomExperienceProps) {
  const [view, setView] = useState<'overview' | 'arrival' | 'live' | 'wrap'>('overview');
  const [clock, setClock] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(durationMinutes * 60);
  const [joined, setJoined] = useState(alreadyJoined);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [wrapPeople, setWrapPeople] = useState<{ id: string; name: string; initial: string; is_you?: boolean; is_host?: boolean; ready?: boolean }[]>([]);
  const [lobbyMeta, setLobbyMeta] = useState({ membersCount: 0, maxMembers: 0, readyCount: 0, allReady: false });
  const [selfReady, setSelfReady] = useState(false);
  const [readySubmitting, setReadySubmitting] = useState(false);
  const [nextStepStatus, setNextStepStatus] = useState('');
  const [nextStepThreadId, setNextStepThreadId] = useState('');
  const [nextStepPending, setNextStepPending] = useState('');
  const [nextStepChoices, setNextStepChoices] = useState<Record<string, 'continue_chat' | 'reconnect' | 'end'>>({});
  const seenChatCount = useRef(0);
  const router = useRouter();

  const isTalk = mode === 'talk';
  const isPlay = mode === 'play' || mode === 'flirt' || mode === 'create';
  const isTogether = mode === 'together' || mode === 'plan';

  // Initialize template based on mode
  const [template, setTemplate] = useState<ExperienceTemplate>(() => templateForExperience(experience) ?? (isPlay ? 'most_likely_to' : isTogether ? 'plan_together' : 'open_talk'));

  const { connected, events, send } = useRoomActivity(roomId, joined);
  const { state: gameState, update: updateGameState } = useRoomGameState<Record<string, unknown>>(roomId, view === 'live', { template });
  const [previewEvents, setPreviewEvents] = useState<RoomEvent[]>([]);
  const roomEvents = roomId ? events : previewEvents;
  const savedRoomTopic = isTalk && roomName.trim() && !DEFAULT_TALK_ROOM_NAMES.has(roomName.trim()) ? roomName.trim() : null;
  const displayedGameState = savedRoomTopic && typeof gameState.customTopic !== 'string'
    ? { ...gameState, customTopic: savedRoomTopic }
    : gameState;

  useEffect(() => {
    const latestTemplate = [...roomEvents].reverse().find((event) => event.event === 'prompt.skipped' && typeof event.payload?.template === 'string')?.payload?.template;
    if (latestTemplate) setTemplate(latestTemplate as ExperienceTemplate);
  }, [roomEvents]);

  function selectTemplate(nextTemplate: ExperienceTemplate) {
    setTemplate(nextTemplate);
    void send('prompt.skipped', { template: nextTemplate });
  }

  function setHostTopic() {
    const nextTopic = window.prompt('Set a new topic for the room:', typeof displayedGameState.customTopic === 'string' ? displayedGameState.customTopic : '');
    if (nextTopic?.trim()) void updateGameState({ ...gameState, customTopic: nextTopic.trim() });
  }

  // Together is strictly 2 people (You + 1 Partner)
  const roomParticipants: RoomParticipant[] = wrapPeople.length ? wrapPeople.map((person, index) => ({ id: person.id, name: person.is_you ? 'You' : person.name, initial: person.initial, color: ['#281D32', '#c94f70', '#8770a0', '#d7953d'][index % 4], isYou: person.is_you, isHost: person.is_host, statusLabel: person.is_you ? 'You' : 'Here' })) : (roomId ? [] : (isTogether ? [DEFAULT_PEOPLE[1]] : DEFAULT_PEOPLE));
  const isRoomHost = roomId ? Boolean(roomParticipants.find((person) => person.isYou)?.isHost) : true;

  const roomSummary = isTalk
    ? 'A small room for people who want an easier way into an honest conversation.'
    : isPlay
    ? 'A playful shared game room with lively interaction, turns, and laughs.'
    : 'A private shared experience for two people to connect, plan, and share moments.';

  useEffect(() => {
    if (view !== 'live') return;
    const startedAt = startsAt ? new Date(startsAt).getTime() : Date.now();
    const update = () => setSeconds(Math.max(0, durationMinutes * 60 - Math.max(0, Math.floor((Date.now() - startedAt) / 1000))));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [view, startsAt, durationMinutes]);

  useEffect(() => { if (view === 'live' && seconds === 0) setView('wrap'); }, [seconds, view]);

  const formattedTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const scheduledStart = startsAt ? new Date(startsAt).getTime() : 0;
  const waitingForSchedule = Boolean(scheduledStart && scheduledStart > clock);
  const scheduledStartLabel = scheduledStart
    ? new Date(scheduledStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  useEffect(() => {
    if (view !== 'arrival' || !scheduledStart) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [view, scheduledStart]);

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

  useEffect(() => {
    if ((!joined && !alreadyJoined) || !roomId) return;
    async function loadPeople() {
      const token = await getAccessToken();
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/rooms/${roomId}/participants/`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (response.ok && Array.isArray(body.data)) {
        setWrapPeople(body.data);
        setSelfReady(Boolean(body.data.find((person: { is_you?: boolean; ready?: boolean }) => person.is_you)?.ready));
        setLobbyMeta({ membersCount: body.meta?.members_count ?? body.data.length, maxMembers: body.meta?.max_members ?? 0, readyCount: body.meta?.ready_count ?? 0, allReady: Boolean(body.meta?.all_ready) });
      }
    }
    void loadPeople();
    if (view !== 'arrival') return;
    const refresh = window.setInterval(() => void loadPeople(), 4000);
    return () => window.clearInterval(refresh);
  }, [roomId, view, joined, alreadyJoined]);

  async function enterRoom() {
    if (waitingForSchedule) return;
    if (selfReady && lobbyMeta.allReady) {
      send('room.ready');
      setView('live');
      return;
    }
    const token = await getAccessToken();
    if (!token || !roomId || readySubmitting) return;
    setReadySubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/rooms/${roomId}/ready/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? 'Your ready state could not be saved.');
      setSelfReady(true);
      const nextMeta = { membersCount: body.data.members_count, maxMembers: body.data.max_members, readyCount: body.data.ready_count, allReady: body.data.all_ready };
      setLobbyMeta(nextMeta);
      if (nextMeta.allReady && !waitingForSchedule) {
        send('room.ready');
        setView('live');
      }
    } finally {
      setReadySubmitting(false);
    }
  }

  async function chooseNextStep(participantId: string, choice: 'continue_chat' | 'reconnect' | 'end') {
    const token = await getAccessToken();
    if (!token || !roomId) return;
    const pendingKey = `${participantId}:${choice}`;
    setNextStepPending(pendingKey);
    const response = await fetch(`${process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000'}/api/v1/rooms/${roomId}/next-steps/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_id: participantId, choice }) });
    const body = await response.json();
    if (!response.ok) { setNextStepPending(''); setNextStepStatus(body.detail ?? 'Your choice could not be saved.'); return; }
    setNextStepPending('');
    setNextStepChoices((current) => ({ ...current, [participantId]: choice }));
    if (body.data.thread_id) setNextStepThreadId(body.data.thread_id);
    setNextStepStatus(body.data.thread_id ? 'You both chose to continue. Your private thread is ready.' : choice === 'reconnect' && body.data.mutual ? 'You are both open to reconnecting in another small room.' : 'Your choice is private and saved.');
    if (choice === 'end') router.push('/discover');
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
            {waitingForSchedule
              ? `This room opens on ${scheduledStartLabel}. You can get ready now, but the experience will not begin early.`
              : 'The room opens once everyone is ready. Your selected experience is ready below:'}
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
              <p className="text-sm font-bold">{lobbyMeta.membersCount} of {lobbyMeta.maxMembers || '…'} people are here</p>
              <span className={`text-xs font-semibold ${connected ? 'text-[#4d8568]' : 'text-[#6F6470]'}`}>
                {connected ? '● Live' : '○ Connecting'}
              </span>
            </div>
            <div className="mt-5 flex -space-x-2">
              {roomParticipants.map((p) => (
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
            disabled={readySubmitting || (selfReady && !lobbyMeta.allReady)}
            onClick={() => void enterRoom()}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-dark-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-dark-900"
          >
            {waitingForSchedule ? (selfReady ? 'Ready for start time' : 'I’m ready') : selfReady ? (lobbyMeta.allReady ? 'Enter the room' : `Ready · ${lobbyMeta.readyCount}/${lobbyMeta.membersCount} ready`) : readySubmitting ? 'Saving…' : 'I’m ready'} <ArrowRight className="h-4 w-4" />
          </button>
          {selfReady && !lobbyMeta.allReady && <p className="mt-3 text-xs text-[#6F6470]">Waiting for the other people currently in the room.</p>}
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
          {wrapPeople.length > 1 && <div className="mx-auto mt-8 max-w-xl space-y-3 text-left"><div className="rounded-2xl bg-[#fff6f2] p-4 text-sm leading-6 text-[#6F6470]"><p className="font-bold text-dark-950">Choose what happens next</p><p className="mt-1">A connection is created only when you and the other person both choose to continue chatting.</p></div>{wrapPeople.filter((person) => !person.is_you).map((person) => { const selectedChoice = nextStepChoices[person.id]; const isSaving = nextStepPending.startsWith(`${person.id}:`); return <div key={person.id} className="rounded-2xl border border-dark-950/10 bg-white p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-2xl bg-dark-950 text-xs font-bold text-white">{person.initial}</span><p className="flex-1 text-sm font-bold">{person.name}</p></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><button disabled={isSaving} onClick={() => chooseNextStep(person.id, 'continue_chat')} className={`rounded-full px-3 py-2 text-xs font-bold ${selectedChoice === 'continue_chat' ? 'bg-[#4d8568] text-white' : 'bg-dark-950 text-white'} disabled:opacity-60`}>{nextStepPending === `${person.id}:continue_chat` ? 'Saving…' : selectedChoice === 'continue_chat' ? 'Selected ✓' : 'Continue & connect'}</button><button disabled={isSaving} onClick={() => chooseNextStep(person.id, 'reconnect')} className={`rounded-full border px-3 py-2 text-xs font-bold ${selectedChoice === 'reconnect' ? 'border-[#4d8568] bg-[#edf7f0] text-[#356447]' : 'border-dark-950/15'} disabled:opacity-60`}>{nextStepPending === `${person.id}:reconnect` ? 'Saving…' : selectedChoice === 'reconnect' ? 'Selected ✓' : 'Reconnect later'}</button><button disabled={isSaving} onClick={() => chooseNextStep(person.id, 'end')} className="rounded-full px-3 py-2 text-xs font-bold text-[#6F6470] disabled:opacity-60">{nextStepPending === `${person.id}:end` ? 'Saving…' : 'End here'}</button></div><p className="mt-3 text-xs leading-5 text-[#6F6470]">Continue & connect opens a private thread if {person.name} chooses it too. Reconnect later keeps the possibility open without adding them to Connections.</p></div>; })}</div>}
          {nextStepStatus && <p className="mx-auto mt-5 max-w-xl rounded-2xl bg-[#fff0f3] p-4 text-sm text-dark-950">{nextStepStatus}</p>}
          {nextStepThreadId && <Link href={`/connections/${nextStepThreadId}`} className="mt-4 inline-flex rounded-full border border-dark-950/15 px-4 py-2.5 text-sm font-bold">Open private thread</Link>}
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
      isHost={isRoomHost}
      onSetTopic={isTalk ? setHostTopic : undefined}
      roomId={roomId}
      gameState={displayedGameState}
      onGameStateChange={updateGameState}
      timeRemaining={formattedTime}
      connected={connected}
      participants={roomParticipants}
      currentTemplate={template}
      onSelectTemplate={selectTemplate}
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
          roomId={roomId}
          gameState={displayedGameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'guided_journey' && (
        <GuidedConversationStage
          roomName={roomName}
          roomId={roomId}
          gameState={displayedGameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'debate' && (
        <DebateStage
          roomName={roomName}
          roomId={roomId}
          gameState={displayedGameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'quick_takes' && (
        <QuickTakesStage
          roomName={roomName}
          roomId={roomId}
          gameState={displayedGameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {/* Play Templates */}
      {template === 'most_likely_to' && (
        <MostLikelyToStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'truth_or_dare' && (
        <TruthOrDareStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
          isHost={true}
          audience={audience}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'guess_my_answer' && (
        <GuessMyAnswerStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'word_battle' && (
        <WordBattleStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {template === 'build_a_story' && (
        <BuildStoryStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
          isHost={true}
          participants={roomParticipants}
          onSendMessage={sendChatMessage}
          onSendReaction={sendReaction}
          onPromptChat={handlePromptChat}
        />
      )}

      {/* Together Templates (2 People · Invite Only) */}
      {template === 'plan_together' && (
        <PlanTogetherStage
          roomName={roomName}
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
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
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
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
          roomId={roomId}
          gameState={gameState}
          onGameStateChange={updateGameState}
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
