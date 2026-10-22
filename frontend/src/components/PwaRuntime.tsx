'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function PwaRuntime() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (!installEvent || dismissed) return null;

  return (
    <aside className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-[22px] border border-dark-950/10 bg-dark-950 p-4 text-white shadow-[0_18px_50px_rgba(40,29,50,.28)] md:bottom-5 md:right-5 md:left-auto" aria-label="Install Dorah">
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss install prompt" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-spark-coral text-white"><Download className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-bold">Keep Dorah close</p>
          <p className="mt-1 text-xs leading-5 text-white/65">Install the app for faster room entry and reminders when something is about to begin.</p>
        </div>
      </div>
      <button type="button" onClick={() => void install()} className="mt-4 w-full rounded-full bg-spark-coral px-4 py-2.5 text-sm font-bold text-white transition hover:bg-spark-flame">Install Dorah</button>
    </aside>
  );
}
