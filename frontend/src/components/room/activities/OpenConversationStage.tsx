'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, MessageSquarePlus, RefreshCw, Compass } from 'lucide-react';
import { BaseStageProps } from '../types';

interface TopicItem {
  id: string;
  topic: string;
  context?: string;
  category?: string;
  suggestedAngles: string[];
}

const DEFAULT_TOPICS: TopicItem[] = [
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

export default function OpenConversationStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const topicIndex = typeof gameState.topicIndex === 'number' ? gameState.topicIndex : 0;
  const [activeAngleIndex, setActiveAngleIndex] = useState<number | null>(null);

  const currentTopic = DEFAULT_TOPICS[topicIndex % DEFAULT_TOPICS.length];
  const customTopic = typeof gameState.customTopic === 'string' && gameState.customTopic.trim() ? gameState.customTopic : null;

  const handleNextTopic = () => {
    setActiveAngleIndex(null);
    onGameStateChange?.({ ...gameState, topicIndex: (topicIndex + 1) % DEFAULT_TOPICS.length });
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
    <section className="flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
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
          “{customTopic ?? currentTopic.topic}”
        </h1>

        {!customTopic && currentTopic.context && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6F6470] sm:text-base">
            {currentTopic.context}
          </p>
        )}

        {/* Optional Conversation Angles / Prompts */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-dark-950/45">
            Suggested angles to explore:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {currentTopic.suggestedAngles.map((angle, idx) => (
              <button
                key={idx}
                onClick={() => handleAngleClick(angle, idx)}
                className={`group flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-left text-xs transition ${
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
      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 pt-5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextTopic}
            className="inline-flex items-center gap-2 rounded-full border border-dark-950/15 bg-white px-4 py-2.5 text-xs font-bold text-dark-950 transition hover:border-dark-950/35 hover:bg-dark-950/5"
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
