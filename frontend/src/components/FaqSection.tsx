'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Duorah another dating app?',
    a: 'No. Traditional dating apps focus on photo directories, endless swiping, and superficial matching. Duorah is an experience-led platform for connection—whether you are flirting with a crush, getting to know someone, or creating a better date night.'
  },
  {
    q: 'Does the other person need to download an app or create an account?',
    a: 'Never. You create a game, send a private link over WhatsApp, Instagram, or iMessage, and they answer directly in their mobile web browser in under 60 seconds. Friction is zero.'
  },
  {
    q: 'How does playing with other people work in Discover mode?',
    a: 'You can either send a private challenge to someone you already like, or queue up in "Blind Vibe Roulette"—a rapid 3-round anonymous game where you match based on humor and opinions first, rather than photos. If you both choose to continue, you unlock a 24-hour chat room with conversation starters.'
  },
  {
    q: 'Can players skip uncomfortable or private questions?',
    a: 'Always. Both participants have full agency to skip any prompt or pass on any dare at any time. Private answers are never exposed without explicit consent.'
  },
  {
    q: 'How does Duorah make money?',
    a: 'Duorah is free to start. We may offer optional themed experiences, planning tools, and keepsakes without locking people into an expensive mandatory subscription.'
  }
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-spark-coral" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          Everything you need to know.
        </h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-dark-900/60 border border-white/10 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-slate-100 hover:text-spark-coral transition-colors"
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-spark-coral' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
