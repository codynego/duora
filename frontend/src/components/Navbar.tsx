'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [['Discover', '#discover'], ['Moments', '#discover'], ['How it works', '#how-it-works']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#171622]/10 bg-[#F3F1EC]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="font-serif text-[28px] tracking-[-.075em] text-[#171622]">Duorah</a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#777381] md:flex">{links.map(([label, href]) => <a key={`${label}-${href}`} href={href} className="transition-colors hover:text-[#171622]">{label}</a>)}</nav>
        <div className="hidden items-center gap-5 md:flex"><a href="/login" className="text-sm font-medium text-[#777381] hover:text-[#171622]">Log in</a><a href="/signup" className="rounded-full bg-[#171622] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#302d42]">Join Duorah <span className="ml-1">↗</span></a></div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle navigation" className="rounded-lg p-2 text-[#171622] md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-[#171622]/10 bg-[#F3F1EC] px-5 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm font-medium text-[#777381]">{links.map(([label, href]) => <a key={`${label}-${href}`} onClick={() => setOpen(false)} href={href}>{label}</a>)}<a onClick={() => setOpen(false)} href="/login" className="mt-2 rounded-full border border-[#171622]/15 px-5 py-3 text-center font-semibold text-[#171622]">Log in</a><a onClick={() => setOpen(false)} href="/signup" className="rounded-full bg-[#171622] px-5 py-3 text-center font-semibold text-white">Join Duorah <span className="ml-1">↗</span></a></div></nav>}
    </header>
  );
}
