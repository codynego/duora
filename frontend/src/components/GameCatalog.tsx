'use client';

import React from 'react';
import { Sparkles, Flame, Eye, Compass, Zap, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';

const GAMES = [
  {
    id: 'predict-me',
    title: 'Predict Me',
    tagline: 'Guess what they will choose before they answer.',
    description: 'Before your partner answers, guess what they will pick. Revealing answers simultaneously triggers laughter, surprises, and instant conversation.',
    badge: 'Top Viral Format',
    rounds: '5 Rounds • ~3 mins',
    icon: Eye,
    gradient: 'from-pink-500/20 via-purple-500/10 to-transparent',
    borderGlow: 'hover:border-pink-500/40',
    tags: ['Crushes', 'Talking Stage', 'Couples']
  },
  {
    id: 'this-or-that',
    title: 'This or That: Spark Edition',
    tagline: 'Fast romantic & lifestyle dilemmas with zero filter.',
    description: 'From "who pays on the first date" to "1am late night food runs", test your alignment across funny, flirty, and spicy dilemmas.',
    badge: 'High Energy',
    rounds: '7 Rounds • ~2 mins',
    icon: Zap,
    gradient: 'from-amber-500/20 via-spark-flame/10 to-transparent',
    borderGlow: 'hover:border-amber-500/40',
    tags: ['Fast Icebreaker', 'Banter']
  },
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare: Voice & Confessions',
    tagline: 'Playful confessions & spicy voice-note dares.',
    description: 'Select your comfort level. Challenge each other to reveal first impressions or send 10-second romantic voice notes right in the game.',
    badge: 'Spicy & Playful',
    rounds: '5 Rounds • ~5 mins',
    icon: Flame,
    gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
    borderGlow: 'hover:border-rose-500/40',
    tags: ['Late Night', 'Talking Stage', 'Couples']
  },
  {
    id: 'choose-your-move',
    title: 'Choose Your Move',
    tagline: 'Interactive dating scenarios and banter choices.',
    description: 'Walk through realistic romantic scenarios: eye contact across the room, the end-of-date parting move, or texting after hours.',
    badge: 'Flirt Mode',
    rounds: '4 Scenarios • ~4 mins',
    icon: Compass,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderGlow: 'hover:border-indigo-500/40',
    tags: ['Singles', 'Dating Practice']
  }
];

export default function GameCatalog() {
  return (
    <section id="games" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-spark-coral/10 border border-spark-coral/20 text-xs font-semibold text-spark-coral mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
            Games with clear rules, fast rounds, and satisfying reveals.
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Every game is built for natural interaction. Curated questions designed to create chemistry—never robotic AI filler.
          </p>
        </div>

        <div className="mt-6 md:mt-0 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Both players can skip any question anytime</span>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className={`group relative rounded-3xl p-6 sm:p-8 bg-dark-900/80 border border-white/10 ${game.borderGlow} transition-all duration-300 flex flex-col justify-between overflow-hidden`}
            >
              {/* Background gradient subtle aura */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              ></div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-spark-coral group-hover:scale-105 group-hover:bg-spark-coral group-hover:text-white transition-all duration-300 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {game.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-spark-coral">
                    <span>{game.rounds}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 group-hover:text-spark-coral transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-300 mt-1">
                    {game.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {game.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {game.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-dark-800 text-slate-400 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Instant guest share link</span>
                </span>

                <a
                  href="#demo"
                  className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-spark-coral transition-colors"
                >
                  <span>Play This</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
