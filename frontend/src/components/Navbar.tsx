'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/lib/current-user';

const defaultLinks = [['Discover', '#discover'], ['Moments', '#discover'], ['How it works', '#how-it-works'], ['Install Dorah', '/install']];
const motionLinks = [['Workflow', '#workflow'], ['Launch kit', '#launch-kit']];

export default function Navbar({ variant = 'default' }: { variant?: 'default' | 'motion' }) {
  const [open, setOpen] = useState(false);
  const { user, ready } = useCurrentUser();
  const isMotion = variant === 'motion';
  const links = isMotion ? motionLinks : defaultLinks;
  const accountHref = ready && user ? '/home' : '/signup';
  const accountLabel = ready && user ? 'Home' : 'Join Dorah';
  if (isMotion) return (
    <header className="sticky top-0 z-50 border-b border-[#102126] bg-[#F8F5EE]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="motion-brand">Dorah<span>.</span></a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#536260] md:flex">{links.map(([label, href]) => <a key={`${label}-${href}`} href={href} className="hover:text-[#102126]">{label}</a>)}</nav>
        <a href="#workflow" className="hidden items-center gap-2 bg-[#102126] px-4 py-2.5 text-sm font-bold text-[#F8F5EE] hover:bg-[#FF6B4A] md:inline-flex">See how it works <ArrowUpRight className="h-3.5 w-3.5" /></a>
        <button onClick={() => setOpen(!open)} aria-label="Toggle navigation" className="p-2 text-[#102126] md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-[#102126] bg-[#F8F5EE] px-5 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm font-bold text-[#536260]">{links.map(([label, href]) => <a key={`${label}-${href}`} onClick={() => setOpen(false)} href={href}>{label}</a>)}<a href="#workflow" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 bg-[#102126] px-4 py-3 text-[#F8F5EE]">See how it works <ArrowUpRight className="h-3.5 w-3.5" /></a></div></nav>}
    </header>
  );
  return (
    <header className="sticky top-0 z-50 border-b border-[#171622]/10 bg-[#F3F1EC]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="font-serif text-[28px] tracking-[-.075em] text-[#171622]">Dorah</a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#777381] md:flex">{links.map(([label, href]) => <a key={`${label}-${href}`} href={href} className="transition-colors hover:text-[#171622]">{label}</a>)}</nav>
        <div className="hidden items-center gap-5 md:flex"><a href="/login" className="text-sm font-medium text-[#777381] hover:text-[#171622]">Log in</a><a href={accountHref} className="rounded-full bg-[#171622] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#302d42]">{accountLabel} <span className="ml-1">↗</span></a></div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle navigation" className="rounded-lg p-2 text-[#171622] md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-[#171622]/10 bg-[#F3F1EC] px-5 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm font-medium text-[#777381]">{links.map(([label, href]) => <a key={`${label}-${href}`} onClick={() => setOpen(false)} href={href}>{label}</a>)}<a onClick={() => setOpen(false)} href="/login" className="mt-2 rounded-full border border-[#171622]/15 px-5 py-3 text-center font-semibold text-[#171622]">Log in</a><a onClick={() => setOpen(false)} href={accountHref} className="rounded-full bg-[#171622] px-5 py-3 text-center font-semibold text-white">{accountLabel} <span className="ml-1">↗</span></a></div></nav>}
    </header>
  );
}
