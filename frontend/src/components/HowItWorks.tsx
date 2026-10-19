'use client';

import React from 'react';
import { Sparkles, Link2, Eye, MessageCircleHeart, Share2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Pick an experience',
    subtitle: 'No 30-minute surveys.',
    desc: 'Choose a fast game tailored to your vibe: flirting, compatibility check, or couple banter. Ready in under 10 seconds.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Drop a private link',
    subtitle: 'Zero app download friction.',
    desc: 'Send the room link to your crush, date, or partner on WhatsApp or Instagram. They play right in their browser without an account.',
    icon: Link2,
  },
  {
    step: '03',
    title: 'The Simultaneous Reveal',
    subtitle: 'Lock in answers independently.',
    desc: 'Both screens reveal answers at the exact same moment. Matches earn chemistry points; clashes spark hilarious conversations.',
    icon: Eye,
  },
  {
    step: '04',
    title: 'Keep the banter alive',
    subtitle: 'Never hit a dead end.',
    desc: 'Export a viral WhatsApp story card, unlock escalating rounds, or dive into a pre-prompted 24-hour chat room.',
    icon: MessageCircleHeart,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-4">
          <Share2 className="w-3.5 h-3.5 text-spark-coral" />
          <span>The Frictionless Loop</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
          How Duorah turns experiences into real connection.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Not another endless swipe catalog. Duorah is designed for shared experiences that bridge digital play into authentic connection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative p-6 sm:p-7 rounded-3xl bg-dark-900/60 border border-white/10 flex flex-col justify-between group hover:border-spark-coral/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-white/20 group-hover:text-spark-coral/50 transition-colors">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-spark-coral group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-spark-coral transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-spark-coral mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Fast & Instant</span>
                <span className="text-slate-400 font-mono">0 Login Needed</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
