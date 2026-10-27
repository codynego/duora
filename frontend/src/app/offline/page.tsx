'use client';

import Link from 'next/link';
import { ArrowLeft, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      window.setTimeout(() => window.location.reload(), 550);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  function retry() {
    setChecking(true);
    if (navigator.onLine) window.location.reload();
    else window.setTimeout(() => setChecking(false), 700);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F5F7FB] px-5 text-[#111B33]">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C9F45D]/35 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#3157F5]/15 blur-3xl" />
      <section className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#111B33]/10 bg-white shadow-[0_24px_70px_rgba(17,27,51,.12)]">
        <div className="bg-[#111B33] p-7 text-white sm:p-10">
          <div className="flex items-center justify-between"><Link href="/" className="font-[Aptos_Display,Arial,sans-serif] text-xl font-black tracking-[-.06em]">Dorah</Link><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] ${online ? 'bg-[#C9F45D]/15 text-[#C9F45D]' : 'bg-white/10 text-white/65'}`}><span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-[#C9F45D]' : 'bg-[#F6C66A]'}`} />{online ? 'Connection restored' : 'Connection paused'}</span></div>
          <span className={`mt-12 grid h-16 w-16 place-items-center rounded-2xl ${online ? 'bg-[#C9F45D]' : 'bg-white/10 text-white/70'} text-[#111B33] transition-colors duration-300`}>{online ? <Wifi className="h-7 w-7" /> : <WifiOff className="h-7 w-7" />}</span>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">{online ? 'Back online' : 'You are offline'}</p>
          <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.88] tracking-[-.08em]">{online ? 'Let’s get you back.' : 'Your overview can wait.'}</h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">{online ? 'Your connection is back. Reloading your latest business records now.' : 'Your saved financial records stay protected. Reconnect to load the latest activity and balances.'}</p>
        </div>
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:p-8">
          <button type="button" onClick={retry} disabled={checking} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.18)] transition hover:bg-[#2748D8] disabled:opacity-80"><RefreshCw className={`h-4 w-4 ${checking ? 'motion-safe:animate-spin' : ''}`} />{checking ? 'Checking connection…' : 'Try again'}</button>
          <Link href="/" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#111B33]/15 px-5 text-sm font-black"><ArrowLeft className="h-4 w-4" />Go home</Link>
        </div>
        <div className="flex items-center gap-2 border-t border-[#111B33]/10 px-6 py-4 text-xs font-semibold text-[#758096] sm:px-8"><CloudOff className="h-4 w-4 text-[#3157F5]" />{checking ? 'Checking your connection now.' : 'This page will reconnect when your signal returns.'}</div>
      </section>
    </main>
  );
}
