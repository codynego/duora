'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/lib/current-user';
import MobileAppNav from '@/components/subscriptions/MobileAppNav';
import SubscriptionNav from '@/components/subscriptions/SubscriptionNav';
import { usePathname } from 'next/navigation';

function Brand() { return <Link href="/dashboard" className="inline-flex items-center gap-2 font-[Aptos_Display,Arial,sans-serif] text-xl font-black tracking-[-.06em]"><span className="flex h-9 w-9 items-end justify-center gap-0.5 rounded-[10px] bg-[#3157F5] p-2 -rotate-3"><i className="h-2 w-1 rounded-t bg-white" /><i className="h-5 w-1 rounded-t bg-white" /><i className="h-3.5 w-1 rounded-t bg-white" /></span>Dorah</Link>; }

export default function MarketplaceShell({ children, active = 'marketplace' }: { children: React.ReactNode; active?: 'marketplace' | 'buy' | 'wallet' | 'settings' | 'share' }) {
  const { user, ready } = useCurrentUser();
  const pathname = usePathname();
  const current = pathname.startsWith('/buy') ? 'buy' : pathname.startsWith('/wallet') ? 'wallet' : pathname.startsWith('/share-seats') ? 'share' : pathname.startsWith('/profile') ? 'settings' : pathname.startsWith('/marketplace') ? 'marketplace' : active;
  if (!ready) return <div className="min-h-screen bg-[#F5F7FB] text-[#111B33]"><aside className="fixed inset-y-0 left-0 hidden w-[250px] bg-[#111B33] p-4 lg:block"><div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" /><div className="mt-12 grid gap-3"><div className="h-10 animate-pulse rounded-lg bg-white/10" /><div className="h-10 animate-pulse rounded-lg bg-white/10" /><div className="h-10 animate-pulse rounded-lg bg-white/10" /></div></aside><main className="lg:ml-[250px]">{children}</main></div>;
  if (!user) return <>{children}</>;
  return <div className="min-h-screen bg-[#F5F7FB] pb-20 text-[#111B33] lg:pb-0"><aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-white/10 bg-[#111B33] p-4 text-white lg:flex"><Brand /><div className="mt-8"><SubscriptionNav active={current} displayName={user.display_name} /></div></aside><MobileAppNav active={current === 'share' ? 'share' : current === 'settings' ? 'profile' : current === 'marketplace' ? 'marketplace' : 'dashboard'} /><main className="lg:ml-[250px]">{children}</main></div>;
}
