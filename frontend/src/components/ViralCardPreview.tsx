'use client';

import React from 'react';
import { Check, Share2, Instagram, MessageCircle, Download } from 'lucide-react';

export default function ViralCardPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Explanation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-spark-coral/10 border border-spark-coral/20 text-xs font-semibold text-spark-coral">
            <Share2 className="w-3.5 h-3.5" />
            <span>Organic Viral Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
            Every game creates a story worth sharing.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            When an experience ends, Dorah does not just say <em>“Thanks for playing.”</em> It gives people a thoughtful moment they can save, share, or use to continue the conversation.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white">Mutual Reveals:</strong> Highlights hilarious disagreements that become inside jokes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white">Built-in Referral Link:</strong> Friends tap the card and immediately challenge their own partners.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white">No Awkwardness:</strong> Private responses remain confidential; only shared fun is highlighted.
              </p>
            </div>
          </div>
        </div>

        {/* Right Story Card Mockup */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-sm">
            {/* Phone Frame Mockup */}
            <div className="relative rounded-[36px] bg-dark-950 p-3 shadow-2xl border-4 border-slate-800/80 ring-1 ring-white/10">
              {/* Story Content Canvas */}
              <div className="relative rounded-[28px] bg-gradient-to-br from-dark-900 via-dark-850 to-slate-900 p-6 overflow-hidden border border-white/10 text-white">
                {/* Floating ambient orb */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-spark-coral/20 blur-2xl"></div>

                {/* Story Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-spark-coral flex items-center justify-center text-xs font-display text-white">S</div>
                    <span className="font-bold text-xs tracking-tight font-display">
                      Spark<span className="text-spark-coral">play</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Vibe Check Card
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="my-6 text-center">
                  <div className="inline-block relative">
                    <span className="text-6xl font-black font-display gradient-text-flame tracking-tight">
                      84%
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1">
                    Strong first-impression energy
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Olu & Tola • 5 Rounds Completed
                  </p>
                </div>

                {/* Highlighted Match & Clash */}
                <div className="space-y-3 my-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                      <span>Closest match</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Both agree 1:00 AM Suya and cold drinks beat fancy restaurants any day.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                      <span>Worth discussing</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Olu insists on knowing phone passcodes; Tola believes personal privacy is non-negotiable!
                    </p>
                  </div>
                </div>

                {/* Watermark CTA */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Think you can score higher?</span>
                  <span className="font-bold text-spark-coral">duorah.vercel.app/play</span>
                </div>
              </div>

              {/* Share actions bar beneath the card */}
              <div className="flex items-center justify-around py-3 px-2 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Story</span>
                </span>
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </span>
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Save Image</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
