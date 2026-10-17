'use client';

import React, { useState } from 'react';
import { CheckCircle2, Flame, Share2, RefreshCw } from 'lucide-react';

interface Option {
  id: string;
  label: string;
}

const SAMPLE_QUESTION = {
  category: 'This or That / first impressions',
  prompt: 'Who should pay on the first date?',
  options: [
    { id: 'asker', label: 'Whoever initiated the date' },
    { id: 'split', label: 'Strict 50 / 50 split' },
    { id: 'guy', label: 'The guy should handle it' },
  ],
  partnerChoice: 'asker', // fictional partner's choice
  partnerName: 'Tola',
};

export default function InteractivePlayground() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => {
      setIsRevealed(true);
    }, 650);
  };

  const handleReset = () => {
    setSelected(null);
    setIsRevealed(false);
  };

  const isMatch = selected === SAMPLE_QUESTION.partnerChoice;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://duora.app/play/DEMO77');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="demo" className="relative w-full max-w-md mx-auto text-left">
      <div className="relative p-3 sm:p-4">
        {/* Card Header: Live Game Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#765b63]">A shared question</span>
          <span className="text-[10px] font-medium text-[#765b63]">answer separately</span>
        </div>

        {/* Players Top Bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#b9a6aa] bg-[#eadbdd] flex items-center justify-center text-[11px] font-display text-[#765b63]">Y</div>
            <div>
              <p className="text-xs font-semibold text-[#261d25] leading-tight">You</p>
              <p className="text-[10px] text-[#765b63]">
                {selected ? 'Answer locked' : 'Choosing...'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              &amp;
            </span>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                Tola
              </p>
              <p className="text-[10px] text-[#765b63] font-medium">Ready</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#d7b6bd] border border-[#b98791] flex items-center justify-center text-[11px] font-display text-[#63283a]">T</div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="my-3 text-center">
          <span className="text-[10px] text-[#765b63] font-medium uppercase tracking-[0.15em]">
            {SAMPLE_QUESTION.category}
          </span>
          <h3 className="font-display text-xl text-[#261d25] mt-1 leading-snug">
            "{SAMPLE_QUESTION.prompt}"
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5 my-4">
          {SAMPLE_QUESTION.options.map((opt) => {
            const isMyPick = selected === opt.id;
            const isPartnerPick = SAMPLE_QUESTION.partnerChoice === opt.id;

            let borderStyle = 'border-[#c7b2b7] hover:border-[#8f2d49] bg-[#f9f2f3]';
            if (isMyPick && !isRevealed) {
              borderStyle = 'border-[#8f2d49] bg-[#f0dde1] ring-1 ring-[#8f2d49]';
            } else if (isRevealed) {
              if (isMyPick && isPartnerPick) {
                borderStyle = 'border-[#5d765c] bg-[#e4ebe0] ring-1 ring-[#5d765c]';
              } else if (isMyPick) {
                borderStyle = 'border-[#8f2d49] bg-[#f0dde1]';
              } else if (isPartnerPick) {
                borderStyle = 'border-[#a7753e] bg-[#f3e6d2]';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => !isRevealed && handleSelect(opt.id)}
                disabled={isRevealed}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${borderStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] text-[#765b63]">{['A', 'B', 'C'][SAMPLE_QUESTION.options.indexOf(opt)]}</span>
                  <span className="text-xs sm:text-sm font-medium text-[#352630]">
                    {opt.label}
                  </span>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                  {isMyPick && (
                    <span className="text-[10px] font-bold text-white bg-spark-coral px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {isRevealed && isPartnerPick && (
                    <span className="text-[10px] font-bold text-[#76521f] bg-[#ead6b8] border border-[#bf985e] px-2 py-0.5 rounded-full">
                      {SAMPLE_QUESTION.partnerName}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reveal Commentary Box */}
        {isRevealed ? (
          <div className="mt-4 p-4 border border-[#b9a6aa] bg-[#f9f2f3] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-2">
              {isMatch ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-[#e4ebe0] flex items-center justify-center text-[#5d765c]">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#4e674d] uppercase tracking-wide">
                    Same answer
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-[#f3e6d2] flex items-center justify-center text-[#a7753e]">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#8a602a] uppercase tracking-wide">
                    A useful disagreement
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#5b4650] leading-relaxed">
              {isMatch
                ? `You both believe whoever asked should pay! Zero awkward bill hesitations on your date.`
                : `You disagreed! ${SAMPLE_QUESTION.partnerName} expects whoever invited to pay. Perfect topic to playfully roast them on WhatsApp right now.`}
            </p>

            <div className="mt-3.5 pt-3 border-t border-[#c7b2b7] flex items-center justify-between gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[#765b63] hover:text-[#261d25] py-1.5 px-3 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3.5 rounded-full bg-spark-coral text-white hover:bg-spark-rose transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Invite Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send to a Crush</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[11px] text-[#765b63] mt-2">
            Choose an answer to see the shared reveal.
          </p>
        )}
      </div>
    </div>
  );
}
