'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Bookmark, Compass, House, MessageCircle, PlayCircle, UserRound, UsersRound } from 'lucide-react';
import { useCurrentUser } from '@/lib/current-user';

const navigation = [
  { label: 'Home', href: '/home', icon: House },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Experiences', href: '/experiences', icon: PlayCircle },
  { label: 'Connections', href: '/connections', icon: MessageCircle },
  { label: 'Moments', href: '/moments', icon: Bookmark },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();
  const displayName = user?.display_name ?? '';
  const initial = displayName.slice(0, 1).toUpperCase();
  return (
    <>
      <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-dark-950/8 bg-white/95 px-5 backdrop-blur md:hidden">
        <Link href="/home" className="text-xl font-bold tracking-[-0.06em] text-dark-950">duora<span className="text-spark-coral">.</span></Link>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full text-dark-950 transition hover:bg-spark-blush"><Bell className="h-[19px] w-[19px]" strokeWidth={1.8} /></button>
          <Link href={user ? '/profile' : '/login'} aria-label={user ? 'Your profile' : 'Sign in'} className="grid h-9 min-w-9 place-items-center rounded-full bg-dark-950 px-2 text-xs font-bold text-white">{ready && user ? initial : ready ? '→' : '·'}</Link>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-dark-950/8 bg-white px-4 py-7 md:flex">
        <Link href="/home" className="px-3 text-2xl font-bold tracking-[-0.065em] text-dark-950">duora<span className="text-spark-coral">.</span></Link>
        <nav className="mt-12 space-y-1" aria-label="Primary navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-spark-blush text-dark-950' : 'text-dark-950/58 hover:bg-dark-950/[0.045] hover:text-dark-950'}`}><Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.2 : 1.9} />{label}</Link>;
          })}
        </nav>
        <section className="mt-auto rounded-2xl bg-[#fff6f2] p-4" aria-label="Start a private experience">
          <UsersRound className="h-5 w-5 text-spark-coral" strokeWidth={1.9} />
          <p className="mt-3 text-sm font-bold tracking-[-0.02em] text-dark-950">Have someone in mind?</p>
          <p className="mt-1 text-xs leading-5 text-dark-950/60">Start something private and send them the link.</p>
          <Link href="/home#invite" className="mt-4 inline-flex text-xs font-bold text-spark-coral transition hover:text-dark-950">Create an invite →</Link>
        </section>
        <Link href={user ? '/profile' : '/login'} className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-dark-950 transition hover:bg-dark-950/[0.045]"><span className="grid h-8 w-8 place-items-center rounded-full bg-dark-950 text-xs font-bold text-white">{ready && user ? initial : '→'}</span><span className="flex-1">{ready && user ? displayName : ready ? 'Sign in' : 'Loading…'}</span><UserRound className="h-4 w-4 text-dark-950/45" strokeWidth={1.8} /></Link>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-dark-950/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return <Link key={label} href={href} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${active ? 'text-spark-coral' : 'text-dark-950/50 hover:text-dark-950'}`}><Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.85} />{label}</Link>;
          })}
          <Link href={user ? '/profile' : '/login'} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${pathname === '/profile' ? 'text-spark-coral' : 'text-dark-950/50 hover:text-dark-950'}`}><UserRound className="h-5 w-5" strokeWidth={pathname === '/profile' ? 2.25 : 1.85} />{user ? 'Profile' : 'Sign in'}</Link>
        </div>
      </nav>
    </>
  );
}
