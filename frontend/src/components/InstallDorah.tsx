'use client';

import { Download, Smartphone, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { initPwaInstall, promptInstall, subscribeToInstallPrompt, type BeforeInstallPromptEvent } from '@/lib/pwa-install';

export default function InstallDorah() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    initPwaInstall();
    return subscribeToInstallPrompt(setInstallEvent);
  }, []);

  async function install() {
    if (await promptInstall()) setInstalled(true);
  }

  return (
    <div className="duora-site min-h-screen bg-[#F3F1EC] text-[#171622]">
      <Navbar />
      <main className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <section className="mx-auto max-w-4xl text-center">
          <p className="eyebrow justify-center"><span className="eyebrow-dot" />Dorah on your home screen</p>
          <h1 className="display-heading mx-auto mt-6 max-w-3xl text-5xl leading-[.94] tracking-[-.07em] sm:text-7xl">Keep the conversation close<span className="text-[#7454A6]">.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#666372]">Install Dorah for a focused, app-like way to return to daily moments, anonymous thoughts, and the connections you choose.</p>
          {installed ? <p className="mx-auto mt-8 inline-flex rounded-full bg-[#E9F2DC] px-4 py-2.5 text-sm font-semibold text-[#496436]">Dorah is already installed on this device.</p> : installEvent ? <button type="button" onClick={() => void install()} className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#171622] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,22,34,.13)]"><Download className="h-4 w-4" />Install Dorah</button> : <p className="mx-auto mt-8 max-w-md text-sm leading-6 text-[#777381]">Use your browser’s menu and choose <strong className="text-[#171622]">Add to Home screen</strong> or <strong className="text-[#171622]">Install Dorah</strong>.</p>}
        </section>
        <section className="mx-auto mt-14 grid max-w-4xl gap-4 sm:mt-20 sm:grid-cols-3">
          {[
            [Smartphone, 'A calmer home', 'Open Dorah from your home screen without searching for the site again.'],
            [Zap, 'Faster return', 'Get straight back to your daily moment and the conversations you care about.'],
            [Sparkles, 'Your space', 'Enjoy the same anonymous-first experience in a focused app window.'],
          ].map(([Icon, title, body]) => <article key={title as string} className="rounded-[24px] border border-[#171622]/10 bg-[#FAF9F5] p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E9E1F1] text-[#7454A6]"><Icon className="h-5 w-5" /></span><h2 className="mt-6 text-lg font-bold tracking-[-.035em]">{title as string}</h2><p className="mt-2 text-sm leading-6 text-[#666372]">{body as string}</p></article>)}
        </section>
        <section className="mx-auto mt-12 max-w-4xl rounded-[24px] border border-[#171622]/10 bg-[#171622] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#C9B9E2]">How to install</p><div className="mt-5 grid gap-6 text-sm leading-6 text-white/70 sm:grid-cols-2"><p><strong className="text-white">Chrome or Edge:</strong> open the browser menu, choose Install app or Add to home screen, then confirm.</p><p><strong className="text-white">iPhone or iPad:</strong> tap Share in Safari, choose Add to Home Screen, then tap Add.</p></div></section>
      </main>
    </div>
  );
}
