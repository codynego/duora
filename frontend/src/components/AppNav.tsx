'use client';

import Link from 'next/link';
import { Bell, House, MessageCircle, Search, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AutoMatchRequestNotice from '@/components/AutoMatchRequestNotice';
import { useCurrentUser } from '@/lib/current-user';

const navigation = [
  { label: 'Home', href: '/home', icon: House },
  { label: 'Explore', href: '/discover', icon: Search },
  { label: 'Connections', href: '/connections', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: UserRound },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();
  const displayName = user?.display_name ?? '';
  const initial = displayName.slice(0, 1).toUpperCase();

  return <>
    <header className="app-nav-mobile sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#292630]/10 bg-[#F7F5F0]/95 px-5 backdrop-blur md:hidden"><Link href="/home" className="font-serif text-[28px] tracking-[-.075em] text-[#292630]">Duora<span className="text-[#7454A6]">.</span></Link><div className="flex items-center gap-3"><button type="button" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full text-[#292630] transition hover:bg-[#E9E1F1]"><Bell className="h-[18px] w-[18px]" strokeWidth={1.8} /></button><Link href={user ? '/profile' : '/login'} aria-label={user ? 'Your profile' : 'Sign in'} className="grid h-9 min-w-9 place-items-center rounded-full bg-[#292630] px-2 text-xs font-bold text-white">{ready && user ? initial : ready ? '→' : '·'}</Link></div></header>
    <aside className="app-nav-desktop fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-[#292630]/10 bg-[#F7F5F0] px-4 py-7 md:flex"><Link href="/home" className="px-3 font-serif text-3xl tracking-[-.075em] text-[#292630]">Duora<span className="text-[#7454A6]">.</span></Link><nav className="mt-12 space-y-1" aria-label="Primary navigation">{navigation.map(({ label, href, icon: Icon }) => { const active = href === '/home' ? pathname === '/home' : pathname.startsWith(href); return <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#E9E1F1] text-[#292630]' : 'text-[#6E6975] hover:bg-[#292630]/[.045] hover:text-[#292630]'}`}><Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />{label}</Link>; })}</nav><section className="mt-auto rounded-2xl bg-[#E9E1F1] p-4" aria-label="Explore invitation"><SparkleMark /><p className="mt-3 text-sm font-bold tracking-[-.02em] text-[#292630]">Find a thought that stays.</p><p className="mt-1 text-xs leading-5 text-[#6E6975]">Your next connection can start with curiosity.</p><Link href="/discover" className="mt-4 inline-flex text-xs font-bold text-[#7454A6] transition hover:text-[#553781]">Open Explore →</Link></section><Link href={user ? '/profile' : '/login'} className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#292630] transition hover:bg-[#292630]/[.045]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#292630] text-xs font-bold text-white">{ready && user ? initial : '→'}</span><span className="flex-1 truncate">{ready && user ? displayName : ready ? 'Sign in' : 'Loading…'}</span><UserRound className="h-4 w-4 text-[#6E6975]" strokeWidth={1.8} /></Link></aside>
    <nav className="app-nav-mobile fixed inset-x-0 bottom-0 z-50 border-t border-[#292630]/10 bg-[#F7F5F0]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-lg items-center justify-around">{navigation.map(({ label, href, icon: Icon }) => { const active = href === '/home' ? pathname === '/home' : pathname.startsWith(href); return <Link key={label} href={href} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${active ? 'text-[#7454A6]' : 'text-[#6E6975] hover:text-[#292630]'}`}><Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.8} />{label}</Link>; })}</div></nav>
    <AutoMatchRequestNotice enabled={ready && Boolean(user)} />
  </>;
}

function SparkleMark() { return <span className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-[#7454A6]"><span className="text-lg">✦</span></span>; }
