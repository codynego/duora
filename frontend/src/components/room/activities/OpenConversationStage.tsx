'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, MessageSquarePlus, RefreshCw, Compass } from 'lucide-react';
import { BaseStageProps } from '../types';
import { ADDITIONAL_OPEN_TOPICS } from './additional-game-content';
import { interestPrompt } from './interest-prompts';
import { getSavedDeckIndex, saveDeckIndex, shuffledDeck } from './prompt-deck';

interface TopicItem {
  id: string;
  topic: string;
  context?: string;
  category?: string;
  suggestedAngles: string[];
}

const BASE_TOPICS: TopicItem[] = [
  {
    id: '1',
    topic: 'What is an unpopular opinion you hold about modern relationships?',
    context: 'It can be about texting etiquette, first dates, split bills, or staying friends with exes.',
    category: 'Perspective',
    suggestedAngles: [
      'Look at another angle: What makes people see it differently?',
      'Tell a personal story: When did this become clear to you?',
      'Go deeper: What is the underlying fear or value here?',
    ],
  },
  {
    id: '2',
    topic: 'What makes you feel most like yourself around someone else?',
    context: 'There is no need to be impressive. Answer in whatever way feels quiet and true.',
    category: 'Vulnerability',
    suggestedAngles: [
      'Tell a story: Who was the last person who brought that out?',
      'Go deeper: What shuts that feeling down fastest?',
      'Another angle: Does it change when you are in a group versus one-on-one?',
    ],
  },
  {
    id: '3',
    topic: 'What is something you have completely changed your mind about in the last two years?',
    context: 'A change of mind can be small, silly, or profound.',
    category: 'Growth',
    suggestedAngles: [
      'Look at another angle: What used to be your strongest argument before?',
      'Tell a story: Was there a specific moment of realization?',
      'Go deeper: How has that shift changed how you make decisions?',
    ],
  },
  {
    id: '4',
    topic: 'Where do you find genuine peace when the world feels too loud?',
    context: 'A place, a person, a solitary routine, or even a specific song.',
    category: 'Comfort',
    suggestedAngles: [
      'Tell a story: Describe the setting and sensory details.',
      'Go deeper: Why do you think that specific thing restores you?',
      'Another angle: How do you protect that space from getting invaded?',
    ],
  },
];

const DEFAULT_TOPICS: TopicItem[] = [
  ...BASE_TOPICS,
  ...ADDITIONAL_OPEN_TOPICS.map((topic, index) => ({
    id: `extra-open-${index + 1}`,
    topic,
    category: 'Conversation',
    suggestedAngles: ['Tell a story from your own life.', 'Ask what shaped that view.', 'Explore the feeling underneath it.'],
  })),
];

export default function OpenConversationStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
  gameState = {},
  onGameStateChange,
  interestTags,
  initialTopic,
}: BaseStageProps) {
  const topicIndex = typeof gameState.topicIndex === 'number' ? gameState.topicIndex : 0;
  const [activeAngleIndex, setActiveAngleIndex] = useState<number | null>(null);
  const deckInitialized = React.useRef(false);

  const topicDeck = React.useMemo(() => shuffledDeck(DEFAULT_TOPICS), []);
  const defaultTopic = topicDeck[topicIndex % topicDeck.length];
  const customTopic = topicIndex === 0 && typeof gameState.customTopic === 'string' && gameState.customTopic.trim() ? gameState.customTopic : null;
  const personalizedPrompt = topicIndex > 0 ? interestPrompt(interestTags, topicIndex - 1) : null;
  const currentTopic = personalizedPrompt ? { ...defaultTopic, topic: personalizedPrompt, category: `Based on your shared interests: ${interestTags?.[0] ?? 'Conversation'}` } : defaultTopic;
  const firstTopic = topicIndex === 0 ? (customTopic ?? initialTopic) : null;

  React.useEffect(() => {
    if (!isHost || deckInitialized.current || typeof gameState.topicIndex === 'number') return;
    deckInitialized.current = true;
    const savedIndex = getSavedDeckIndex('open-conversation', topicDeck.length);
    if (savedIndex > 0) onGameStateChange?.({ ...gameState, topicIndex: savedIndex });
  }, [gameState, isHost, onGameStateChange, topicDeck.length]);

  const handleNextTopic = () => {
    setActiveAngleIndex(null);
    const nextIndex = (topicIndex + 1) % topicDeck.length;
    saveDeckIndex('open-conversation', nextIndex, topicDeck.length);
    onGameStateChange?.({ ...gameState, topicIndex: nextIndex, customTopic: '' });
  };

  const handleAngleClick = (angle: string, index: number) => {
    setActiveAngleIndex(index);
    if (onPromptChat) {
      onPromptChat(angle);
    } else {
      onSendMessage(`💭 Angle to explore: “${angle}”`);
    }
  };

  const handleSuggestCustomTopic = () => {
    const prompt = window.prompt('Suggest a topic or question for the room:');
    if (prompt && prompt.trim()) {
      onSendMessage(`✨ Suggested topic: ${prompt.trim()}`);
    }
  };

  return (
    <section className="game-stage game-stage--open flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
      {/* Editorial Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-[11px] font-bold tracking-wider text-spark-coral">
            <Compass className="h-3.5 w-3.5" />
            OPEN CONVERSATION
          </span>
          <span className="hidden text-xs text-[#6F6470] sm:inline">
            · {currentTopic.category}
          </span>
        </div>
        <p className="text-xs font-medium text-[#6F6470]">
          No timer or turn order. Talk freely.
        </p>
      </div>

      {/* Main Topic Stage (The Hero) */}
      <div className="flex w-full max-w-4xl flex-none flex-col py-8 sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.18em] text-dark-950/40">
          A TOPIC FOR THE ROOM
        </p>
        <h1 className="mt-3 max-w-3xl break-words text-pretty text-[clamp(1.6rem,4.4vw,2.85rem)] font-bold leading-[1.12] tracking-[-0.04em] text-dark-950">
          “{firstTopic ?? currentTopic.topic}”
        </h1>

        {!firstTopic && currentTopic.context && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6F6470] sm:text-base">
            {currentTopic.context}
          </p>
        )}

        {/* Optional Conversation Angles / Prompts */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-dark-950/45">
            Suggested angles to explore:
          </p>
          <div className="mt-2.5 grid gap-2 sm:flex sm:flex-wrap">
            {currentTopic.suggestedAngles.map((angle, idx) => (
              <button
                key={idx}
                onClick={() => handleAngleClick(angle, idx)}
                className={`group flex w-full items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-xs transition sm:w-auto sm:py-2 ${
                  activeAngleIndex === idx
                    ? 'border-spark-coral bg-[#fff0f3] text-spark-coral font-bold'
                    : 'border-dark-950/10 bg-white/70 text-dark-950/80 hover:border-dark-950/25 hover:bg-white'
                }`}
              >
                <Lightbulb
                  className={`h-3.5 w-3.5 shrink-0 ${
                    activeAngleIndex === idx ? 'text-spark-coral' : 'text-spark-amber'
                  }`}
                />
                <span>{angle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Controls (No aggressive 'Next' button) */}
      <div className="mt-auto flex shrink-0 flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={handleNextTopic}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-dark-950/15 bg-white px-4 py-2.5 text-xs font-bold text-dark-950 transition hover:border-dark-950/35 hover:bg-dark-950/5"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#6F6470]" />
            Change topic
          </button>

          <button
            onClick={handleSuggestCustomTopic}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-spark-coral hover:bg-spark-coral/8"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Suggest a topic
          </button>
        </div>

        <p className="text-[11px] text-[#6F6470]">
          People can speak in person or use the room chat drawer below.
        </p>
      </div>
    </section>
  );
}
