'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CircleHelp, FolderKanban, Library, Menu, Palette, Plus, Settings2, X } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/brand-kit', label: 'Brand kit', icon: Palette },
  { href: '/dashboard/assets', label: 'Assets', icon: Library },
];

export default function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  return <div className="motion-dashboard min-h-screen bg-[#F8F5EE] text-[#102126]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-[#102126] bg-[#102126] p-4 text-[#F8F5EE] md:flex">
      <Brand />
      <Link href="/dashboard/new" className="dashboard-new-button mt-10"><Plus className="h-4 w-4" /> New launch</Link>
      <nav className="mt-7 space-y-1" aria-label="Studio navigation">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`dashboard-nav-item ${active(href) ? 'dashboard-nav-item--active' : ''}`}><Icon className="h-[18px] w-[18px]" />{label}</Link>)}</nav>
      <div className="mt-auto border-t border-white/15 pt-4"><Link href="/" className="dashboard-nav-item"><ArrowLeft className="h-[18px] w-[18px]" />Back to site</Link><Link href="/dashboard/help" className={`dashboard-nav-item ${active('/dashboard/help') ? 'dashboard-nav-item--active' : ''}`}><CircleHelp className="h-[18px] w-[18px]" />Help</Link><Link href="/dashboard/settings" className={`dashboard-nav-item ${active('/dashboard/settings') ? 'dashboard-nav-item--active' : ''}`}><Settings2 className="h-[18px] w-[18px]" />Settings</Link><div className="mt-5 flex items-center gap-3 px-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#FF6B4A] text-xs font-black text-[#102126]">S</span><span><span className="block text-sm font-bold">Shina’s studio</span><span className="block text-xs text-white/55">Free workspace</span></span></div></div>
    </aside>
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#102126] bg-[#F8F5EE]/95 px-5 backdrop-blur md:hidden"><Link href="/" className="motion-brand">Dorah<span>.</span></Link><div className="flex gap-2"><Link href="/dashboard/new" className="grid h-10 w-10 place-items-center bg-[#102126] text-[#F8F5EE]" aria-label="New launch"><Plus className="h-5 w-5" /></Link><button type="button" onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center border border-[#102126]" aria-label="Open navigation"><Menu className="h-5 w-5" /></button></div></header>
    {menuOpen && <div className="fixed inset-0 z-50 bg-[#102126] p-5 text-[#F8F5EE] md:hidden"><div className="flex items-center justify-between"><Brand /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button></div><Link href="/dashboard/new" onClick={() => setMenuOpen(false)} className="dashboard-new-button mt-10"><Plus className="h-4 w-4" />New launch</Link><nav className="mt-7 space-y-1">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`dashboard-nav-item ${active(href) ? 'dashboard-nav-item--active' : ''}`}><Icon className="h-[18px] w-[18px]" />{label}</Link>)}<Link href="/dashboard/help" onClick={() => setMenuOpen(false)} className="dashboard-nav-item"><CircleHelp className="h-[18px] w-[18px]" />Help</Link><Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className="dashboard-nav-item"><Settings2 className="h-[18px] w-[18px]" />Settings</Link></nav></div>}
    <main className="min-h-screen md:ml-[252px]"><div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">{children}</div></main>
  </div>;
}

function Brand() { return <Link href="/dashboard" className="motion-brand inline-block">Dorah<span>.</span><span className="ml-2 align-middle font-mono text-[9px] font-bold uppercase tracking-[.18em] text-white/45">Studio</span></Link>; }
