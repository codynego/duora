'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Laugh,
  HandHeart,
  Sparkles,
  MessageCircle,
  MoreHorizontal,
  Send,
  Volume2,
  X,
  Compass,
  Layers,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { ExperienceTemplate, RoomParticipant, ReactionKind, RoomEvent } from './types';

interface RoomShellProps {
  roomName: string;
  isHost?: boolean;
  onSetTopic?: () => void;
  roomId?: string;
  gameState?: Record<string, unknown>;
  onGameStateChange?: (state: Record<string, unknown>) => void;
  timeRemaining: string;
  connected: boolean;
  participants: RoomParticipant[];
  currentTemplate: ExperienceTemplate;
  onSelectTemplate?: (template: ExperienceTemplate) => void;
  onReaction: (kind: ReactionKind) => void;
  onSendMessage: (message: string) => void;
  onEndRoom: () => void;
  events: RoomEvent[];
  chatOpen: boolean;
  onToggleChat: () => void;
  unreadCount?: number;
  children: React.ReactNode;
}

const TEMPLATE_LABELS: Record<
  ExperienceTemplate,
  { title: string; subtitle: string; tag: string; category: 'talk' | 'play' | 'together' }
> = {
  // Talk Templates
  open_talk: {
    title: 'Open Conversation',
    subtitle: 'A shared topic, not a game',
    tag: 'OPEN CONVERSATION',
    category: 'talk',
  },
  guided_journey: {
    title: 'Guided Conversation',
    subtitle: 'A journey through questions',
    tag: 'GUIDED JOURNEY',
    category: 'talk',
  },
  debate: {
    title: 'Debate',
    subtitle: 'Positions, reveals, and arguments',
    tag: 'DEBATE',
    category: 'talk',
  },
  quick_takes: {
    title: 'Quick Takes',
    subtitle: 'Fast reactions and rapid-fire opinions',
    tag: 'QUICK TAKES',
    category: 'talk',
  },
  // Play Templates
  most_likely_to: {
    title: 'Party Game: Most Likely To',
    subtitle: 'Group votes and funny reveals',
    tag: 'PARTY GAME',
    category: 'play',
  },
  truth_or_dare: {
    title: 'Challenge: Truth or Dare',
    subtitle: 'Turns, dares, and consent-led passing',
    tag: 'CHALLENGES & DARES',
    category: 'play',
  },
  guess_my_answer: {
    title: 'Guessing: Guess My Answer',
    subtitle: 'Predicting answers and revealing matches',
    tag: 'GUESSING GAME',
    category: 'play',
  },
  word_battle: {
    title: 'Quick Game: Word Battle',
    subtitle: 'Fast-paced word prompt and live scores',
    tag: 'QUICK GAME',
    category: 'play',
  },
  build_a_story: {
    title: 'Creative Game: Build a Story',
    subtitle: 'Collaborative canvas built line-by-line',
    tag: 'CREATIVE GAME',
    category: 'play',
  },
  // Together Templates (2 People · Invite Only)
  plan_together: {
    title: 'Together: Plan a Date',
    subtitle: 'Budget, time & mood matching (2 people)',
    tag: 'PLAN A DATE',
    category: 'together',
  },
  shared_challenges: {
    title: 'Together: Shared Challenges',
    subtitle: 'Joint mini-goals checklist (2 people)',
    tag: 'SHARED CHALLENGE',
    category: 'together',
  },
  date_night: {
    title: 'Together: Date Night Anywhere',
    subtitle: '3-chapter guided date journey (2 people)',
    tag: 'DATE NIGHT',
    category: 'together',
  },
};

export default function RoomShell({
  roomName,
  isHost = false,
  onSetTopic,
  timeRemaining,
  connected,
  participants,
  currentTemplate,
  onSelectTemplate,
  onReaction,
  onSendMessage,
  onEndRoom,
  events,
  chatOpen,
  onToggleChat,
  unreadCount = 0,
  children,
}: RoomShellProps) {
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  // Extract latest reaction and latest chat message for ephemeral notification bubbles
  const latestReaction = [...events].reverse().find((item) => item.event === 'reaction.sent');
  const latestChat = [...events].reverse().find((item) => item.event === 'chat.sent');

  const [activeReactionToast, setActiveReactionToast] = useState<RoomEvent | null>(null);
  const [activeChatBubble, setActiveChatBubble] = useState<RoomEvent | null>(null);

  useEffect(() => {
    if (!latestReaction) return;
    setActiveReactionToast(latestReaction);
    const timer = window.setTimeout(() => setActiveReactionToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [latestReaction]);

  useEffect(() => {
    if (!latestChat || chatOpen || latestChat.payload?.actor_name === 'You') {
      if (chatOpen) setActiveChatBubble(null);
      return;
    }
    setActiveChatBubble(latestChat);
    const timer = window.setTimeout(() => setActiveChatBubble(null), 4000);
    return () => window.clearTimeout(timer);
  }, [latestChat, chatOpen]);

  const chatMessages = events
    .filter((e) => e.event === 'chat.sent')
    .map((e, idx) => ({
      id: `${e.user_id ?? 'user'}-${idx}`,
      author: String(e.payload?.actor_name ?? 'Room member'),
      body: String(e.payload?.message ?? ''),
    }))
    .filter((m) => m.body.trim().length > 0);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const currentTemplateMeta = TEMPLATE_LABELS[currentTemplate];

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#16101c] text-white">
      {/* Top Header */}
      <header className="z-20 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-2 border-b border-white/8 px-3 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-rows-1 sm:gap-3 sm:px-6 sm:py-3">
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 sm:col-auto sm:row-auto sm:gap-3">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </Link>

          <div className="hidden sm:block h-4 w-px bg-white/12" />

          {/* Template Switcher Dropdown / Badge */}
          {onSelectTemplate ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex min-w-0 max-w-[min(13rem,calc(100vw-9rem))] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/12 sm:max-w-none"
              >
                <Layers className="h-3.5 w-3.5 text-spark-coral" />
                <span className="min-w-0 truncate">{currentTemplateMeta.title}</span>
                <ChevronDown className="h-3 w-3 text-white/50" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-white/15 bg-[#251b2e] p-2 shadow-2xl backdrop-blur-md">
                    <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-spark-coral">
                      TALK FORMATS
                    </p>
                    {(Object.keys(TEMPLATE_LABELS) as ExperienceTemplate[])
                      .filter((key) => TEMPLATE_LABELS[key].category === 'talk')
                      .map((key) => {
                        const item = TEMPLATE_LABELS[key];
                        const active = currentTemplate === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              onSelectTemplate(key);
                              setMenuOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-1.5 text-left transition ${
                              active
                                ? 'bg-spark-coral text-white font-bold'
                                : 'text-white/80 hover:bg-white/8'
                            }`}
                          >
                            <p className="text-xs">{item.title}</p>
                            <p className={`text-[10px] ${active ? 'text-white/80' : 'text-white/50'}`}>
                              {item.subtitle}
                            </p>
                          </button>
                        );
                      })}

                    <div className="my-2 border-t border-white/10" />

                    <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-spark-amber">
                      PLAY FORMATS
                    </p>
                    {(Object.keys(TEMPLATE_LABELS) as ExperienceTemplate[])
                      .filter((key) => TEMPLATE_LABELS[key].category === 'play')
                      .map((key) => {
                        const item = TEMPLATE_LABELS[key];
                        const active = currentTemplate === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              onSelectTemplate(key);
                              setMenuOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-1.5 text-left transition ${
                              active
                                ? 'bg-spark-coral text-white font-bold'
                                : 'text-white/80 hover:bg-white/8'
                            }`}
                          >
                            <p className="text-xs">{item.title}</p>
                            <p className={`text-[10px] ${active ? 'text-white/80' : 'text-white/50'}`}>
                              {item.subtitle}
                            </p>
                          </button>
                        );
                      })}

                    <div className="my-2 border-t border-white/10" />

                    <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#3b7d56]">
                      TOGETHER (2 PEOPLE · INVITE ONLY)
                    </p>
                    {(Object.keys(TEMPLATE_LABELS) as ExperienceTemplate[])
                      .filter((key) => TEMPLATE_LABELS[key].category === 'together')
                      .map((key) => {
                        const item = TEMPLATE_LABELS[key];
                        const active = currentTemplate === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              onSelectTemplate(key);
                              setMenuOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-1.5 text-left transition ${
                              active
                                ? 'bg-spark-coral text-white font-bold'
                                : 'text-white/80 hover:bg-white/8'
                            }`}
                          >
                            <p className="text-xs">{item.title}</p>
                            <p className={`text-[10px] ${active ? 'text-white/80' : 'text-white/50'}`}>
                              {item.subtitle}
                            </p>
                          </button>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/70">
              {currentTemplateMeta.title}
            </span>
          )}
        </div>

        {/* Center Room Info */}
        <div className="col-span-2 row-start-2 min-w-0 border-t border-white/8 pt-2 text-center sm:col-auto sm:row-auto sm:border-t-0 sm:pt-0">
          <p className="truncate text-sm font-bold text-white">{roomName}</p>
          <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-white/60">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? 'bg-[#8bd49f]' : 'bg-[#f4c96b]'
              }`}
            />
            <span>{connected ? 'Live' : 'Connecting'}</span>
            <span>·</span>
            <span>{timeRemaining}</span>
          </div>
        </div>

        {/* Right Exit / More */}
        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-1.5 sm:col-auto sm:row-auto sm:gap-2">
          {isHost && onSetTopic && <button aria-label="Set topic" onClick={onSetTopic} className="inline-flex items-center gap-1.5 rounded-full border border-spark-coral/40 bg-spark-coral/10 px-2.5 py-1.5 text-xs font-semibold text-spark-rose transition hover:bg-spark-coral/20 sm:px-3"><Pencil className="h-3.5 w-3.5" /><span className="hidden sm:inline">Set topic</span></button>}
          <button
            onClick={onEndRoom}
            className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15"
          >
            End
          </button>
        </div>
      </header>

      {/* Participant Presence Strip */}
      <section
        aria-label="Participants in room"
        className="scrollbar-none flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/6 bg-[#120d17] px-4 py-2 sm:px-6"
      >
        <span className="mr-1 text-[11px] font-semibold text-white/40">
          {participants.length} here:
        </span>
        {participants.map((person) => (
          <div
            key={person.id}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
              person.isSpeaking
                ? 'border-spark-coral bg-spark-coral/15 ring-1 ring-spark-coral'
                : 'border-white/8 bg-white/4'
            }`}
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-lg text-[11px] font-bold text-white shadow"
              style={{ background: person.color }}
            >
              {person.initial}
            </span>
            <div className="min-w-0">
              <span className="block truncate text-xs font-medium text-white/90">
                {person.name}
              </span>
              {person.statusLabel && (
                <span className="block truncate text-[9px] text-white/50">
                  {person.statusLabel}
                </span>
              )}
            </div>
            {person.isSpeaking && (
              <Volume2 className="h-3 w-3 shrink-0 animate-pulse text-spark-coral" />
            )}
          </div>
        ))}
      </section>

      {/* Main Dynamic Stage Slot */}
      <div className="room-stage-stage relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
        {children}
      </div>

      {/* Ephemeral Reaction Toast */}
      {activeReactionToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-24 z-30 flex animate-bounce items-center gap-2 rounded-full border border-white/15 bg-[#281d32]/95 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
            {activeReactionToast.payload?.kind === 'laugh' && <Laugh className="h-3.5 w-3.5 text-spark-amber" />}
            {activeReactionToast.payload?.kind === 'support' && <HandHeart className="h-3.5 w-3.5 text-[#8bd49f]" />}
            {activeReactionToast.payload?.kind === 'cheer' && <Sparkles className="h-3.5 w-3.5 text-[#d8b5f1]" />}
            {activeReactionToast.payload?.kind === 'heart' && <Heart className="h-3.5 w-3.5 fill-current text-spark-rose" />}
          </span>
          <span>
            {String(activeReactionToast.payload?.actor_name ?? 'Someone')}{' '}
            {activeReactionToast.payload?.kind === 'laugh'
              ? 'laughed'
              : activeReactionToast.payload?.kind === 'support'
              ? 'sent support'
              : activeReactionToast.payload?.kind === 'cheer'
              ? 'celebrated'
              : 'sent appreciation'}
          </span>
        </div>
      )}

      {/* Ephemeral Chat Peek Bubble (When Chat is Closed) */}
      {activeChatBubble && !chatOpen && (
        <button
          onClick={onToggleChat}
          className="fixed bottom-20 left-4 z-30 max-w-[min(22rem,calc(100vw-2rem))] animate-fadeIn rounded-2xl border border-dark-950/10 bg-[#fffdfa] px-3.5 py-2.5 text-left text-dark-950 shadow-2xl transition hover:scale-[1.02]"
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider text-spark-coral">
            {String(activeChatBubble.payload?.actor_name ?? 'Room member')}
          </span>
          <span className="block truncate text-xs font-medium text-dark-950/90">
            {String(activeChatBubble.payload?.message ?? '')}
          </span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {chatOpen && (
        <section
          aria-label="Room discussion chat"
          className="fixed bottom-20 left-3 right-3 z-40 mx-auto flex h-[min(24rem,calc(100dvh-170px))] max-w-md flex-col overflow-hidden rounded-[26px] border border-dark-950/10 bg-[#fffdfa] text-dark-950 shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-dark-950/8 bg-[#fff6f2]/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-dark-950">Room conversation</p>
              <p className="text-[10px] text-[#6F6470]">Visible to everyone here</p>
            </div>
            <button
              onClick={onToggleChat}
              className="grid h-7 w-7 place-items-center rounded-full bg-dark-950/6 hover:bg-dark-950/12"
            >
              <X className="h-4 w-4 text-dark-950/70" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <article
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
                    msg.author === 'You'
                      ? 'ml-auto bg-spark-coral text-white'
                      : 'bg-dark-950/5 text-dark-950'
                  }`}
                >
                  <p
                    className={`text-[9px] font-bold ${
                      msg.author === 'You' ? 'text-white/80' : 'text-spark-coral'
                    }`}
                  >
                    {msg.author}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed">{msg.body}</p>
                </article>
              ))
            ) : (
              <p className="px-2 py-4 text-center text-xs leading-relaxed text-[#6F6470]">
                No messages yet. Chat is optional—use it whenever you want to drop a thought.
              </p>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex shrink-0 gap-2 border-t border-dark-950/8 bg-white p-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Say something to the room…"
              maxLength={400}
              className="min-w-0 flex-1 rounded-full bg-dark-950/5 px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-spark-coral"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="grid h-8 w-8 place-items-center rounded-full bg-spark-coral text-white disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      )}

      {/* Reaction Popover Picker */}
      {reactionPickerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setReactionPickerOpen(false)}
          />
          <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/20 bg-[#281d32] p-1.5 shadow-2xl">
            <button
              onClick={() => {
                onReaction('heart');
                setReactionPickerOpen(false);
              }}
              title="Heart"
              className="grid h-10 w-10 place-items-center rounded-full text-spark-rose hover:bg-white/10"
            >
              <Heart className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={() => {
                onReaction('laugh');
                setReactionPickerOpen(false);
              }}
              title="Laugh"
              className="grid h-10 w-10 place-items-center rounded-full text-spark-amber hover:bg-white/10"
            >
              <Laugh className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                onReaction('support');
                setReactionPickerOpen(false);
              }}
              title="Support"
              className="grid h-10 w-10 place-items-center rounded-full text-[#8bd49f] hover:bg-white/10"
            >
              <HandHeart className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                onReaction('cheer');
                setReactionPickerOpen(false);
              }}
              title="Celebrate"
              className="grid h-10 w-10 place-items-center rounded-full text-[#d8b5f1] hover:bg-white/10"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Bottom Sticky Action Dock */}
      <footer className="z-20 flex h-[68px] shrink-0 items-center justify-center gap-2 border-t border-white/8 bg-[#16101c]/95 px-4 backdrop-blur-md">
        {/* Quick Reaction Button */}
        <button
          onClick={() => setReactionPickerOpen((o) => !o)}
          aria-label="Send a reaction"
          className={`grid h-11 w-11 place-items-center rounded-full transition ${
            reactionPickerOpen
              ? 'bg-spark-coral text-white'
              : 'bg-white/8 text-spark-rose hover:bg-white/16'
          }`}
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>

        {/* Text Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          aria-label="Toggle text chat"
          className={`relative grid h-11 w-11 place-items-center rounded-full transition ${
            chatOpen
              ? 'bg-spark-coral text-white'
              : 'bg-white/8 text-white hover:bg-white/16'
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && !chatOpen && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-spark-coral px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

      </footer>
    </div>
  );
}
