'use client';

import Link from 'next/link';
import { ArrowUpRight, CircleUserRound, LayoutDashboard, LifeBuoy, Search, Settings, Share2, WalletCards, Zap } from 'lucide-react';

type Active = 'overview' | 'marketplace' | 'buy' | 'subscriptions' | 'share' | 'wallet' | 'settings';

const primary = [
  { key: 'overview' as const, label: 'Overview', description: 'Spending summary, renewals, recent activity', href: '/dashboard', icon: LayoutDashboard },
  { key: 'marketplace' as const, label: 'Marketplace', description: 'Browse reviewed access', href: '/marketplace', icon: Search },
  { key: 'buy' as const, label: 'Buy', description: 'Airtime, data, electricity, TV', href: '/marketplace?category=utilities', icon: Zap },
  { key: 'subscriptions' as const, label: 'My subscriptions', description: 'Your active access and renewals', href: '/dashboard#subscriptions', icon: WalletCards },
  { key: 'share' as const, label: 'Shared seat', description: 'List or manage a seat', href: '/share-seats', icon: Share2 },
  { key: 'wallet' as const, label: 'Wallet & Transactions', description: 'Payments, refunds, and history', href: '/dashboard#transactions', icon: WalletCards },
];

export default function SubscriptionNav({ active = 'overview', displayName }: { active?: Active; displayName?: string }) {
  return <nav aria-label="Subscription navigation" className="grid gap-1">
    {primary.map(({ key, label, description, href, icon: Icon }) => {
      const selected = active === key;
      return <Link key={key} href={href} className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${selected ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[.07] hover:text-white'}`}>
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-[#C9F45D]' : 'text-white/45 group-hover:text-white/75'}`} />
        <span className="min-w-0"><span className="block text-sm font-bold leading-5">{label}</span><span className="mt-0.5 block text-[10px] leading-4 text-white/40 group-hover:text-white/55">{description}</span></span>
      </Link>;
    })}
    <div className="my-2 border-t border-white/10" />
    <Link href="/profile" className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${active === 'settings' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[.07] hover:text-white'}`}>
      <Settings className="mt-0.5 h-4 w-4 shrink-0 text-white/45 group-hover:text-white/75" />
      <span className="min-w-0"><span className="block text-sm font-bold leading-5">Settings &amp; Support</span><span className="mt-0.5 block text-[10px] leading-4 text-white/40 group-hover:text-white/55">Profile, security, help, disputes</span></span>
    </Link>
    <Link href="/help" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-white/45 hover:text-white"><LifeBuoy className="h-4 w-4" />Help center<ArrowUpRight className="ml-auto h-3.5 w-3.5" /></Link>
    {displayName && <Link href="/profile" className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4 text-xs font-bold text-white/70"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#C9F45D] text-[#111B33]">{displayName.slice(0, 1).toUpperCase()}</span>{displayName}<CircleUserRound className="ml-auto h-4 w-4 text-white/40" /></Link>}
  </nav>;
}
