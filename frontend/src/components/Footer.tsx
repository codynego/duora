'use client';

import React from 'react';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-950 pt-16 pb-12">
      {/* Pre-footer Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 p-8 sm:p-14 border border-white/10 overflow-hidden text-center shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-spark-coral/15 blur-[100px] pointer-events-none rounded-full"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-spark-coral/10 border border-spark-coral/25 text-xs font-semibold text-spark-coral">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready to test your connection?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
              Make every conversation <span className="gradient-text-flame">unforgettable.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300">
              Create a free game in 10 seconds. Send the link to someone special and see what happens when the answers lock in.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#demo"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-spark-coral to-spark-flame text-white font-bold text-sm shadow-xl shadow-spark-coral/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Start a Free Game Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#stages"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
              >
                Explore Relationship Stages
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-spark-flame to-spark-coral flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-display">
              Spark<span className="text-spark-coral">play</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#discover" className="hover:text-white transition-colors">
              Singles (Discover)
            </a>
            <a href="#connect" className="hover:text-white transition-colors">
              Talking Stage (Connect)
            </a>
            <a href="#together" className="hover:text-white transition-colors">
              Couples (Together)
            </a>
            <a href="#games" className="hover:text-white transition-colors">
              Game Catalog
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy & Consent
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Duorah. Meet through minds. Connect by choice.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-spark-coral fill-spark-coral" />
            <span>for lovers & flirts everywhere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
