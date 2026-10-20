'use client';

import Link from 'next/link';
import { CloudOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950">
      <section className="w-full max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0f3] text-spark-coral"><CloudOff className="h-6 w-6" /></span>
        <p className="section-label mt-7">You are offline</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-.06em]">The room can wait.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6F6470]">Reconnect to open live rooms and send messages. Your saved moments remain available when they have already loaded.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" />Try again</button>
          <Link href="/home" className="inline-flex items-center rounded-full border border-dark-950/15 px-5 py-3 text-sm font-bold">Go home</Link>
        </div>
      </section>
    </main>
  );
}
