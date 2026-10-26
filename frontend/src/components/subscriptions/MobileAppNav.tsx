'use client';

import Link from 'next/link';
import { LayoutDashboard, Search, UsersRound, UserRound } from 'lucide-react';

export default function MobileAppNav({ active = 'dashboard' }: { active?: 'dashboard' | 'marketplace' | 'share' | 'profile' }) {
  const items = [["dashboard", '/dashboard', LayoutDashboard, 'Home'], ['marketplace', '/marketplace', Search, 'Explore'], ['share', '/share-seats', UsersRound, 'Share'], ['profile', '/profile', UserRound, 'Profile']] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[#111B33]/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(17,27,51,.08)] backdrop-blur lg:hidden" aria-label="App navigation">{items.map(([key, href, Icon, label]) => <Link key={key} href={href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black ${active === key ? 'text-[#3157F5]' : 'text-[#758096]'}`}><Icon className={`h-5 w-5 ${active === key ? 'stroke-[2.5]' : ''}`} /><span>{label}</span></Link>)}</nav>;
}
