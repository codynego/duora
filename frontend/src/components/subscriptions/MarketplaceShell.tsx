'use client';

import Link from 'next/link';
import { LayoutDashboard, Menu, Search, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/lib/current-user';

function Brand() { return <Link href="/dashboard" className="inline-flex items-center gap-2 font-[Aptos_Display,Arial,sans-serif] text-xl font-black tracking-[-.06em]"><span className="flex h-9 w-9 items-end justify-center gap-0.5 rounded-[10px] bg-[#3157F5] p-2 -rotate-3"><i className="h-2 w-1 rounded-t bg-white" /><i className="h-5 w-1 rounded-t bg-white" /><i className="h-3.5 w-1 rounded-t bg-white" /></span>Dorah</Link>; }

export default function MarketplaceShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useCurrentUser(); const [menu, setMenu] = useState(false);
  if (!ready || !user) return <>{children}</>;
  const links = <nav className="grid gap-1"><Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white"><LayoutDashboard className="h-4 w-4" />Overview</Link><Link href="/marketplace" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3 text-sm font-bold text-white"><Search className="h-4 w-4" />Marketplace</Link><Link href="/share-seats" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white"><UsersRound className="h-4 w-4" />Share seats</Link></nav>;
  return <div className="min-h-screen bg-[#F5F7FB] text-[#111B33]"><aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-white/10 bg-[#111B33] p-4 text-white lg:flex"><Brand /><div className="mt-10">{links}</div><div className="mt-auto border-t border-white/10 pt-4"><Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#C9F45D] text-xs font-black text-[#111B33]">{user.display_name.slice(0, 1).toUpperCase()}</span>{user.display_name}</Link></div></aside><header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#111B33]/10 bg-[#F5F7FB]/95 px-4 backdrop-blur lg:hidden"><Brand /><button onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-[#111B33]/15 bg-white" aria-label="Open navigation"><Menu className="h-5 w-5" /></button></header>{menu && <div className="fixed inset-0 z-50 bg-[#111B33] p-5 text-white lg:hidden"><header className="flex items-center justify-between"><Brand /><button onClick={() => setMenu(false)} aria-label="Close navigation"><X /></button></header><div className="mt-10" onClick={() => setMenu(false)}>{links}</div></div>}<main className="lg:ml-[250px]">{children}</main></div>;
}
