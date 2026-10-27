'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { initPwaInstall, promptInstall, subscribeToInstallPrompt, type BeforeInstallPromptEvent } from '@/lib/pwa-install';

export default function PwaRuntime() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    initPwaInstall();
    return subscribeToInstallPrompt(setInstallEvent);
  }, []);

  async function install() {
    await promptInstall();
  }

  if (!installEvent || dismissed) return null;

  return (
    <aside className="pwa-install-toast fixed inset-x-3 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#111B33] p-4 text-white shadow-[0_18px_50px_rgba(17,27,51,.3)] md:bottom-5 md:right-5 md:left-auto" aria-label="Install Dorah">
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss install prompt" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C9F45D] text-[#111B33]"><Download className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-black">Your business overview, one tap away</p>
          <p className="mt-1 text-xs leading-5 text-white/65">Install Dorah to open your financial workspace from your home screen.</p>
        </div>
      </div>
      <button type="button" onClick={() => void install()} className="mt-4 h-11 w-full rounded-xl bg-[#3157F5] px-4 text-sm font-black text-white transition hover:bg-[#2748D8] active:scale-[.99]">Install Dorah</button>
    </aside>
  );
}
