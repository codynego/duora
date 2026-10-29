'use client';

import { Download, LoaderCircle, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { initPwaInstall, promptInstall, subscribeToInstallPrompt, type BeforeInstallPromptEvent } from '@/lib/pwa-install';

const installDismissedKey = 'dorah:pwa-install-dismissed';

export default function PwaRuntime() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setStandalone(isStandalone);
    setDismissed(window.localStorage.getItem(installDismissedKey) === 'true');

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone;
    const helpTimer = isIos && pathname.startsWith('/dashboard')
      ? window.setTimeout(() => setShowIosHelp(true), 1800)
      : undefined;

    const handleControllerChange = () => window.location.reload();
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      void navigator.serviceWorker.register('/sw.js').then((registration) => {
        if (registration.waiting) setUpdateReady(true);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      }).catch(() => undefined);
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    initPwaInstall();
    const unsubscribe = subscribeToInstallPrompt(setInstallEvent);
    return () => {
      if (helpTimer) window.clearTimeout(helpTimer);
      unsubscribe();
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [pathname]);

  function dismissInstall() {
    setDismissed(true);
    window.localStorage.setItem(installDismissedKey, 'true');
  }

  async function install() {
    if (installing) return;
    setInstalling(true);
    try {
      if (await promptInstall()) setStandalone(true);
      else setShowIosHelp(true);
    } finally { setInstalling(false); }
  }

  function refreshForUpdate() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      window.setTimeout(() => window.location.reload(), 250);
    }
  }

  const showInstall = !standalone && !dismissed && pathname !== '/install' && (Boolean(installEvent) || showIosHelp);
  if (!showInstall && !updateReady) return null;

  return <>
    {showInstall && <aside className="pwa-install-toast fixed inset-x-3 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#111B33] p-4 text-white shadow-[0_18px_50px_rgba(17,27,51,.3)] md:bottom-5 md:right-5 md:left-auto" aria-label="Install Dorah">
      <button type="button" onClick={dismissInstall} aria-label="Dismiss install prompt" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3 pr-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C9F45D] text-[#111B33]"><Download className="h-4 w-4" /></span><div><p className="text-sm font-black">Your business overview, one tap away</p><p className="mt-1 text-xs leading-5 text-white/65">{installEvent ? 'Install Dorah to open your financial workspace from your home screen.' : 'In Safari, tap Share, then choose Add to Home Screen.'}</p></div></div>
      {installEvent && <button type="button" disabled={installing} aria-busy={installing} onClick={() => void install()} className="button-loading mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-4 text-sm font-black text-white transition hover:bg-[#2748D8] active:scale-[.99] disabled:opacity-70">{installing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{installing ? 'Opening install…' : 'Install Dorah'}</button>}
    </aside>}
    {updateReady && <aside className="fixed inset-x-3 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] z-[61] mx-auto max-w-md rounded-2xl border border-[#3157F5]/20 bg-white p-4 text-[#111B33] shadow-[0_18px_50px_rgba(17,27,51,.2)] md:bottom-5 md:right-5 md:left-auto" role="status"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEF1FF] text-[#3157F5]"><RefreshCw className="h-4 w-4" /></span><div><p className="text-sm font-black">A newer Dorah is ready</p><p className="mt-1 text-xs leading-5 text-[#64708A]">Refresh to use the latest version of the app.</p></div></div><button type="button" onClick={refreshForUpdate} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-4 text-xs font-black text-white">Refresh Dorah <RefreshCw className="h-3.5 w-3.5" /></button></aside>}
  </>;
}
