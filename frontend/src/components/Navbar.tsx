'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [['Discover', '#discover'], ['Experiences', '#experiences'], ['How it works', '#how-it-works']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#281D32]/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="text-[23px] font-bold tracking-[-.06em] text-dark-950">Duorah</a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#6F6470] md:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="transition-colors hover:text-dark-950">{label}</a>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href="/login" className="text-sm font-medium text-[#6F6470] hover:text-dark-950">Sign in</a>
          <a href="/signup" className="rounded-full bg-spark-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d94767]">Get started</a>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle navigation" className="rounded-lg p-2 text-dark-950 md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-[#281D32]/10 bg-white px-5 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm font-medium text-[#6F6470]">
        {links.map(([label, href]) => <a key={href} onClick={() => setOpen(false)} href={href}>{label}</a>)}
        <a onClick={() => setOpen(false)} href="/login" className="mt-2 rounded-full border border-[#281D32]/12 px-5 py-3 text-center font-semibold text-dark-950">Sign in</a>
        <a onClick={() => setOpen(false)} href="/signup" className="rounded-full bg-spark-coral px-5 py-3 text-center font-semibold text-white">Get started</a>
      </div></nav>}
    </header>
  );
}
