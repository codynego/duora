'use client';

import { ArrowDownLeft, ArrowRight, Check, Download, Plus, ShieldCheck, Smartphone, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import DorahPublicShell from '@/components/dorah-market/DorahPublicShell';
import { initPwaInstall, promptInstall, subscribeToInstallPrompt, type BeforeInstallPromptEvent } from '@/lib/pwa-install';

export default function InstallDorah() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    initPwaInstall();
    return subscribeToInstallPrompt(setInstallEvent);
  }, []);

  async function install() {
    if (await promptInstall()) setInstalled(true);
    else setShowInstallHelp(true);
  }

  return (
    <DorahPublicShell>
      <div className="min-h-screen bg-[#F5F7FB] text-[#111B33]">
      <main className="overflow-hidden px-4 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12">
        <section className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[28px] border border-[#111B33]/[.06] bg-white p-6 shadow-[0_20px_70px_rgba(17,27,51,.07)] sm:p-10 lg:grid-cols-[1fr_.9fr] lg:gap-12 lg:p-14">
          <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#EAF0FF] blur-3xl" />
          <div className="relative z-10 pwa-install-copy">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#3157F5]/10 bg-[#EAF0FF] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]"><span className="h-1.5 w-1.5 rounded-full bg-[#3157F5]" />Dorah for your home screen</p>
            <h1 className="mt-6 max-w-xl font-[Aptos_Display,Arial,sans-serif] text-5xl font-black leading-[.93] tracking-[-.075em] sm:text-6xl">Your financial picture, one tap away<span className="text-[#3157F5]">.</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#64708A] sm:text-base sm:leading-7">Open your business overview quickly, review what needs attention, and record money as it moves.</p>
            {installed ? <p role="status" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#557516]/15 bg-[#EAF6E4] px-4 py-3 text-sm font-bold text-[#45652D]"><Check className="h-4 w-4" />Dorah is ready on this device.</p> : <><button type="button" onClick={() => void install()} className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(49,87,245,.24)] transition hover:-translate-y-0.5 hover:bg-[#2748D8] active:translate-y-0"><Download className="h-4 w-4" />Install Dorah <ArrowRight className="h-4 w-4" /></button>{(!installEvent || showInstallHelp) && <div className="mt-4 max-w-lg rounded-xl border border-[#111B33]/[.08] bg-[#F8F9FC] p-4 text-xs leading-5 text-[#64708A]"><strong className="text-[#111B33]">Use your browser’s install option.</strong> On iPhone or iPad, tap Share in Safari and choose Add to Home Screen. On Android or desktop, open the browser menu and choose Install app.</div>}</>}
            <p className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#758096]"><ShieldCheck className="h-3.5 w-3.5 text-[#557516]" />Same account. Same protected financial workspace.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[390px] pwa-install-card rounded-[30px] border-[7px] border-[#111B33] bg-[#F5F7FB] p-3 shadow-[0_28px_70px_rgba(17,27,51,.24)]">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#111B33]/20" />
            <div className="flex items-center justify-between px-2"><div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#758096]">Good morning</p><p className="mt-1 text-lg font-black tracking-[-.05em]">Your overview</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#111B33] text-xs font-black text-white">D</span></div>
            <article className="mt-4 rounded-2xl bg-[#111B33] p-4 text-white"><div className="flex items-center justify-between"><p className="text-[10px] font-bold text-white/55">Cash position</p><span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold text-[#C9F45D]">THIS MONTH</span></div><p className="mt-2 text-3xl font-black tracking-[-.06em]">₦2,480,000</p><p className="mt-3 flex items-center gap-1 text-[9px] font-bold text-[#C9F45D]"><ArrowDownLeft className="h-3 w-3" />Income and expenses in one view</p></article>
            <article className="mt-3 rounded-2xl border border-[#111B33]/[.06] bg-white p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-black">Needs your attention</p><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#FFF4DA] text-[10px] font-black text-[#936B13]">2</span></div><p className="mt-2 border-t border-[#111B33]/[.06] pt-2 text-[9px] text-[#64708A]">1 overdue customer payment</p><p className="mt-2 text-[9px] text-[#64708A]">1 supplier bill due soon</p></article>
            <div className="mt-3 grid grid-cols-3 gap-2">{[['Home', Smartphone], ['Insights', Sparkles], ['Record', Plus]].map(([label, Icon]) => <div key={label as string} className="grid min-h-14 place-items-center gap-1 rounded-xl bg-white py-2 text-[#3157F5]"><Icon className="h-4 w-4" /><span className="text-[8px] font-black">{label as string}</span></div>)}</div>
            <p className="mt-3 pb-1 text-center text-[8px] font-semibold text-[#9AA3B5]">Illustrative preview</p>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-3 sm:grid-cols-3 sm:gap-4">
          {[[Smartphone, 'Opens like an app', 'Launch from your home screen with a focused, full-screen workspace.'], [Zap, 'Quick actions close by', 'Reach your overview and record activity without navigating a full website.'], [Sparkles, 'Always in view', 'Keep collections, bills, and financial signals close at hand.']].map(([Icon, title, body], index) => <article key={title as string} style={{ animationDelay: `${index * 90}ms` }} className="pwa-install-feature rounded-2xl border border-[#111B33]/[.07] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(17,27,51,.08)] sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF0FF] text-[#3157F5]"><Icon className="h-5 w-5" /></span><h2 className="mt-5 text-sm font-black">{title as string}</h2><p className="mt-2 text-xs leading-5 text-[#64708A]">{body as string}</p></article>)}
        </section>
        <section className="mx-auto mt-4 max-w-6xl rounded-2xl bg-[#111B33] p-5 text-white sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#C9F45D]">Set up in seconds</p><h2 className="mt-2 text-lg font-black">Add Dorah to your device</h2></div><div className="grid gap-4 text-xs leading-5 text-white/65 sm:max-w-2xl sm:grid-cols-2"><p><strong className="text-white">Android or desktop:</strong> use the install prompt above, or open your browser menu and select Install app.</p><p><strong className="text-white">iPhone or iPad:</strong> open this page in Safari, tap Share, choose Add to Home Screen, then tap Add.</p></div></div></section>
      </main>
      </div>
    </DorahPublicShell>
  );
}
