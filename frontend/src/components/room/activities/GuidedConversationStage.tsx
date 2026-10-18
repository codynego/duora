'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Lock,
  Eye,
  SkipForward,
  HelpCircle,
  MessageCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { BaseStageProps } from '../types';

interface QuestionItem {
  id: string;
  prompt: string;
  deeperPrompt: string;
  sampleResponses: Record<string, string>;
}

const QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    prompt: 'What is one small ritual that reliably resets your day?',
    deeperPrompt: 'What happens inside you when that ritual gets interrupted?',
    sampleResponses: {
      Ada: 'A walk around the block without my phone, listening to the street sounds.',
      Maya: 'Grinding fresh coffee and standing by the window for five quiet minutes.',
      Jon: 'Putting on one specific ambient album while stretching.',
      Sam: 'Writing down just one single sentence about how the morning felt.',
    },
  },
  {
    id: 'q2',
    prompt: 'If you could wake up tomorrow having gained one quality or ability, what would it be?',
    deeperPrompt: 'Is this quality something you needed more of as a kid, or need now?',
    sampleResponses: {
      Ada: 'The ability to stay unbothered by other people’s passive aggression.',
      Maya: 'Waking up naturally energized without needing three alarms.',
      Jon: 'Effortless fluency in any language I encounter.',
      Sam: 'Radical confidence when stepping into unfamiliar rooms.',
    },
  },
  {
    id: 'q3',
    prompt: 'What is a memory from your childhood that feels like a sunlit snapshot?',
    deeperPrompt: 'What makes that specific moment stick while others fade?',
    sampleResponses: {
      Ada: 'Sitting in the backseat during a late-night drive watching streetlights blur.',
      Maya: 'Eating watermelon on the porch with sticky hands and no shoes.',
      Jon: 'Building a blanket fort during a thunderous summer rainstorm.',
      Sam: 'The smell of pancakes on a Saturday morning when there was nowhere to rush.',
    },
  },
  {
    id: 'q4',
    prompt: 'What does a truly fulfilling friendship look like to you right now?',
    deeperPrompt: 'Are you getting that currently, or is there a gap you yearn to fill?',
    sampleResponses: {
      Ada: 'Being able to exist in comfortable silence together without needing an agenda.',
      Maya: 'People who remember the small details and check in a week later.',
      Jon: 'Friends who cheer for your weird passions without irony.',
      Sam: 'Consistency—knowing we can pick up seamlessly even after months.',
    },
  },
];

export default function GuidedConversationStage({
  roomName,
  isHost,
  participants,
  onSendMessage,
  onPromptChat,
  gameState = {},
  onGameStateChange,
}: BaseStageProps) {
  const questionIndex = typeof gameState.questionIndex === 'number' ? gameState.questionIndex : 0;
  const phase = gameState.phase === 'revealed' ? 'revealed' : 'responding';
  const [myAnswer, setMyAnswer] = useState('');
  const submitted = Boolean(gameState.submitted);
  const [showDeeperPrompt, setShowDeeperPrompt] = useState(false);
  const [selectedResponseName, setSelectedResponseName] = useState<string | null>(null);

  const currentQ = QUESTIONS[questionIndex % QUESTIONS.length];
  const customTopic = typeof gameState.customTopic === 'string' && gameState.customTopic.trim() ? gameState.customTopic : null;
  const totalQuestions = QUESTIONS.length;
  const responseNames = participants.length ? participants.map((person) => person.isYou ? 'You' : person.name) : ['You'];
  const sampleResponses = Object.values(currentQ.sampleResponses).reduce<Record<string, string>>((responses, answer, index) => {
    const name = responseNames[index];
    if (name) responses[name] = answer;
    return responses;
  }, {});

  const handleSubmitMyAnswer = () => {
    if (!myAnswer.trim()) return;
    onGameStateChange?.({ ...gameState, questionIndex, phase: 'responding', submitted: true });
    // In real room socket, dispatch answer.saved.
    // When all are ready or host triggers reveal:
  };

  const handleRevealAll = () => {
    onGameStateChange?.({ ...gameState, questionIndex, phase: 'revealed', submitted });
  };

  const handleNextQuestion = () => {
    onGameStateChange?.({ ...gameState, questionIndex: (questionIndex + 1) % totalQuestions, phase: 'responding', submitted: false });
    setMyAnswer('');
    setShowDeeperPrompt(false);
    setSelectedResponseName(null);
  };

  const handleSkip = () => {
    handleNextQuestion();
  };

  const handleAskInChat = (name: string, text: string) => {
    const questionText = `Hey @${name}, regarding your answer: “${text}” — what made you think of that first?`;
    if (onPromptChat) {
      onPromptChat(questionText);
    } else {
      onSendMessage(questionText);
    }
  };

  return (
    <section className="flex min-h-full w-full flex-col overflow-y-auto rounded-[28px] bg-[#fffdfa] p-5 text-dark-950 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:rounded-[32px] sm:p-8 lg:p-10">
      {/* Top Progress & Context */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-spark-coral">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex gap-1.5">
            {QUESTIONS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-5 rounded-full transition-all ${
                  idx === questionIndex
                    ? 'bg-spark-coral'
                    : idx < questionIndex
                    ? 'bg-dark-950/40'
                    : 'bg-dark-950/10'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {phase === 'responding' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-medium text-spark-coral">
              <Lock className="h-3.5 w-3.5" />
              Private answers
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-medium text-[#3b7d56]">
              <Eye className="h-3.5 w-3.5" />
              Revealed to group
            </span>
          )}
        </div>
      </div>

      {/* Main Question Card Stage */}
      <div className="flex w-full max-w-4xl flex-none flex-col py-8 sm:py-12">
        <p className="text-[11px] font-bold tracking-[0.16em] text-dark-950/40">
          JOURNEY PROMPT
        </p>

        <h1 className="mt-2.5 max-w-3xl break-words text-pretty text-[clamp(1.5rem,4.2vw,2.75rem)] font-bold leading-[1.14] tracking-[-0.035em] text-dark-950">
          {customTopic ?? currentQ.prompt}
        </h1>

        {showDeeperPrompt && (
          <div className="mt-4 rounded-2xl border border-spark-coral/25 bg-[#fff6f2] p-4 text-xs leading-relaxed text-dark-950 sm:text-sm">
            <span className="font-bold text-spark-coral">Deeper reflection: </span>
            {customTopic ? 'Use the new host topic as the room’s next question.' : currentQ.deeperPrompt}
          </div>
        )}

        {/* Phase 1: Private Submissions Mode */}
        {phase === 'responding' && (
          <div className="mt-6 max-w-2xl">
            <label className="block text-xs font-semibold text-[#6F6470]">
              Your thoughts (optional to write, or just share verbally):
            </label>
            <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                value={myAnswer}
                disabled={submitted}
                onChange={(e) => setMyAnswer(e.target.value)}
                placeholder="Type your response here..."
                className="min-w-0 flex-1 rounded-2xl border border-dark-950/15 bg-white px-4 py-3 text-xs outline-none transition focus:border-spark-coral focus:ring-2 focus:ring-spark-coral/15 disabled:bg-dark-950/5 sm:text-sm"
              />
              <button
                onClick={handleSubmitMyAnswer}
                disabled={submitted || !myAnswer.trim()}
                className="shrink-0 rounded-2xl bg-dark-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-dark-900 disabled:opacity-40"
              >
                {submitted ? 'Answer Locked In' : 'Lock In Answer'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#6F6470]">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-spark-coral" />
                Answers stay hidden until revealed together.
              </span>

              <button
                onClick={handleRevealAll}
                className="font-bold text-spark-coral hover:underline"
              >
                Reveal responses now →
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Simultaneous Group Reveal Mode */}
        {phase === 'revealed' && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6F6470]">
              Room Responses:
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries({
                ...sampleResponses,
                ...(myAnswer ? { You: myAnswer } : {}),
              }).map(([name, ans]) => (
                <div
                  key={name}
                  onClick={() => setSelectedResponseName(name)}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    selectedResponseName === name
                      ? 'border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral'
                      : 'border-dark-950/10 bg-white/70 hover:border-dark-950/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-spark-coral">{name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskInChat(name, ans);
                      }}
                      className="text-[11px] font-semibold text-[#6F6470] hover:text-dark-950"
                    >
                      Ask in chat
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-dark-950 sm:text-sm">
                    “{ans}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stage Progression Controls */}
      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 pt-5">
        <div className="flex items-center gap-2">
          {!showDeeperPrompt && (
            <button
              onClick={() => setShowDeeperPrompt(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-dark-950/15 bg-white px-3.5 py-2 text-xs font-bold text-dark-950 transition hover:bg-dark-950/5"
            >
              <HelpCircle className="h-3.5 w-3.5 text-spark-coral" />
              Go deeper
            </button>
          )}

          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#6F6470] hover:text-dark-950"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
        </div>

        <button
          onClick={handleNextQuestion}
          className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-2.5 text-xs font-bold text-white transition hover:bg-spark-flame"
        >
          <span>Next question</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
