'use client';

import Link from 'next/link';
import { LayoutDashboard, MoreHorizontal, Search, Settings, Share2, UserRound, WalletCards, Zap } from 'lucide-react';
import { useState } from 'react';

export default function MobileAppNav({ active = 'dashboard' }: { active?: 'dashboard' | 'marketplace' | 'share' | 'profile' }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const items = [["dashboard", '/dashboard', LayoutDashboard, 'Home'], ['marketplace', '/marketplace', Search, 'Explore'], ['buy', '/buy', Zap, 'Buy'], ['share', '/dashboard#subscriptions', WalletCards, 'Subs']] as const;
  const moreItems = [['share-seat', '/share-seats', Share2, 'Share seat'], ['wallet', '/wallet', WalletCards, 'Wallet'], ['profile', '/dashboard/profile', UserRound, 'Profile'], ['settings', '/dashboard/settings', Settings, 'Settings']] as const;
  return <>
    <style jsx global>{`header.sticky.top-0 > div > button[aria-label="Open navigation"] { display: none; }`}</style>
    <Link href="/dashboard/profile" aria-label="Open profile" className="fixed right-16 top-4 z-[60] grid h-10 w-10 place-items-center rounded-full border border-[#111B33]/10 bg-white text-[#111B33] shadow-[0_6px_18px_rgba(17,27,51,.12)] lg:hidden"><UserRound className="h-4 w-4" /></Link>
    {moreOpen && <><button type="button" aria-label="Close more navigation" className="fixed inset-0 z-40 bg-[#111B33]/30 lg:hidden" onClick={() => setMoreOpen(false)} /><section className="fixed inset-x-3 bottom-[76px] z-50 rounded-2xl border border-[#111B33]/10 bg-white p-2 shadow-[0_18px_55px_rgba(17,27,51,.2)] lg:hidden" aria-label="More navigation"><div className="grid gap-1">{moreItems.map(([key, href, Icon, label]) => <Link key={key} href={href} onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#111B33] hover:bg-[#F5F7FB]"><Icon className="h-4 w-4 text-[#3157F5]" />{label}</Link>)}</div></section></>}
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#111B33]/10 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(17,27,51,.08)] backdrop-blur lg:hidden" aria-label="App navigation">{items.map(([key, href, Icon, label]) => <Link key={key} href={href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black ${active === key ? 'text-[#3157F5]' : 'text-[#758096]'}`}><Icon className={`h-5 w-5 ${active === key ? 'stroke-[2.5]' : ''}`} /><span>{label}</span></Link>)}<button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black ${moreOpen ? 'text-[#3157F5]' : 'text-[#758096]'}`}><MoreHorizontal className="h-5 w-5" /><span>More</span></button></nav>
  </>;
}
