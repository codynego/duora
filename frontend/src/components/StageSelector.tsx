'use client';

import React, { useState } from 'react';
import { Sparkles, HeartHandshake, Flame, ArrowUpRight, Check, MessageCircle, Gift, UserPlus } from 'lucide-react';

export default function StageSelector() {
  const [activeTab, setActiveTab] = useState<'single' | 'talking' | 'together'>('single');

  const content = {
    single: {
      id: 'discover',
      badge: 'Stage 1 • Discover',
      title: 'For Singles & Crushes',
      tagline: 'Skip the dry small talk. Send a game that makes them want to reply.',
      description:
        'Instead of asking "how was your day?", send a private game link on WhatsApp or Instagram. They play in their mobile browser without downloading an app or creating an account.',
      features: [
        {
          title: 'Flirt & Guess Games',
          desc: 'Create a 60-second quiz about your vibe, red flags, or 3am cravings and see what they predict.',
          icon: Flame,
        },
        {
          title: 'Blind Vibe Roulette',
          desc: 'Tired of swipe apps? Play rapid 3-round anonymous banter games with compatible singles online.',
          icon: UserPlus,
        },
        {
          title: 'Dating Practice & Scenarios',
          desc: 'Interactive scenarios to test witty comebacks, first-date moves, and icebreakers risk-free.',
          icon: Sparkles,
        },
      ],
      ctaText: 'Start a Crush Game',
      pillColor: 'bg-spark-coral/10 text-spark-coral border-spark-coral/20',
      actionGradient: 'from-spark-coral to-spark-flame',
      quote: '"I sent a game link to my crush on WhatsApp at midnight. We ended up on a 3-hour phone call discussing our answers."'
    },
    talking: {
      id: 'connect',
      badge: 'Stage 2 • Connect',
      title: 'For The Talking Stage',
      tagline: 'Discover compatibility without turning dates into job interviews.',
      description:
        'You like each other, but the conversation gets repetitive. Dorah creates playful tension, unexpected revelations, and natural reasons to spend hours laughing together.',
      features: [
        {
          title: 'How Well Do You Know Me?',
          desc: 'Predict each other’s pet peeves, love languages, and habits. Reveal answers simultaneously.',
          icon: Sparkles,
        },
        {
          title: 'Banter Clashes & Story Cards',
          desc: 'Celebrate funny disagreements. Generate viral recap cards ready for your WhatsApp Status or close friends.',
          icon: MessageCircle,
        },
        {
          title: 'Truth or Dare: Voice Edition',
          desc: 'Escalating comfort levels. Unlock flirty confessions and playful voice-note challenges.',
          icon: Flame,
        },
      ],
      ctaText: 'Test Our Chemistry',
      pillColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionGradient: 'from-amber-500 to-spark-coral',
      quote: '"We’ve been talking for 2 months, but this game made us discover things we would never have brought up normally."'
    },
    together: {
      id: 'together',
      badge: 'Stage 3 • Together',
      title: 'For Long-Term Couples',
      tagline: 'Break the routine. Reignite romantic intrigue and shared date nights.',
      description:
        'Keep the spark alive after months or years. Dorah gives couples fresh date-night challenges, relationship milestones, and surprise experiences to look forward to every week.',
      features: [
        {
          title: 'Weekly Couple Rituals',
          desc: 'A fresh, playful challenge every Sunday designed to inspire surprise date nights and quality time.',
          icon: HeartHandshake,
        },
        {
          title: 'Secret Deep-Dive Questions',
          desc: 'Thoughtfully curated questions exploring intimacy, shared dreams, and unspoken desires.',
          icon: Sparkles,
        },
        {
          title: 'Memories & Keepsakes',
          desc: 'Turn completed milestones and games into personalized digital memory books or physical gifts.',
          icon: Gift,
        },
      ],
      ctaText: 'Explore Couple Packs',
      pillColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      actionGradient: 'from-rose-500 to-pink-600',
      quote: '"Even after 3 years together, Dorah gave us that early-relationship flutter again during our Saturday night in."'
    },
  };

  const current = content[activeTab];

  return (
    <section id="stages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-spark-coral" />
          <span>One Platform • Every Stage of Romance</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
          Where is your heart right now?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Dorah adapts to your relationship status. Pick where you are to experience tailored moments designed for you.
        </p>

        {/* Tab Switcher Pills */}
        <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-dark-900 border border-white/10 shadow-lg">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-spark-coral text-white shadow-md shadow-spark-coral/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I'm Single / Crushing
          </button>
          <button
            onClick={() => setActiveTab('talking')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'talking'
                ? 'bg-spark-coral text-white shadow-md shadow-spark-coral/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Talking Stage
          </button>
          <button
            onClick={() => setActiveTab('together')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'together'
                ? 'bg-spark-coral text-white shadow-md shadow-spark-coral/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In a Relationship
          </button>
        </div>
      </div>

      {/* Dynamic Stage Content Panel */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-white/10 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-spark-coral/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Info & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${current.pillColor}`}
            >
              {current.badge}
            </span>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-display">
              {current.title}
            </h3>

            <p className="text-lg text-spark-coral font-medium">
              {current.tagline}
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {current.description}
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {current.features.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-dark-900/60 border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-spark-coral/10 flex items-center justify-center text-spark-coral mb-3">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{feat.title}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{feat.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA action */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#demo"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r ${current.actionGradient} shadow-lg shadow-spark-coral/25 hover:brightness-110 active:scale-95 transition-all`}
              >
                <span>{current.ctaText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Free to play • No guest app download required
              </span>
            </div>
          </div>

          {/* Right Column: Cultural Quote & Social Proof Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 p-6 sm:p-7 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-spark-coral flex items-center justify-center text-xs font-display text-white border-2 border-dark-900">A</div>
                  <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-display text-white border-2 border-dark-900">B</div>
                </div>
                <span className="text-xs font-semibold text-slate-300">From a Dorah room</span>
              </div>

              <blockquote className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
                {current.quote}
              </blockquote>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Verified Match Session</span>
                <span className="text-spark-coral font-medium">Dorah Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
