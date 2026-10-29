'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';

export default function PwaStartup() {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'leaving'>('hidden');

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (!standalone) {
      if (pathname === '/launch') router.replace('/');
      return;
    }
    // `/launch` is the installed app's entry route. Only this route performs
    // the launch redirect, so users can still visit the public homepage from
    // inside the installed app whenever they choose.
    if (pathname !== '/launch') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase('entering');
    let cancelled = false;
    const minimumDuration = reducedMotion ? 160 : 900;
    const startedAt = Date.now();
    const redirect = (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
      if (cancelled) return;
      const remaining = Math.max(0, minimumDuration - (Date.now() - startedAt));
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase('leaving');
        window.setTimeout(() => {
          if (cancelled) return;
          router.replace(user ? '/dashboard' : '/login?next=%2Fdashboard');
        }, reducedMotion ? 80 : 300);
      }, remaining);
    };
    void getCurrentUser().then(redirect).catch(() => redirect(null));

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (phase === 'hidden' || pathname !== '/launch') return null;

  return (
    <div className={`pwa-startup pwa-startup--${phase}`} role="status" aria-live="polite" aria-label="Opening Dorah">
      <div className="pwa-startup__glow pwa-startup__glow--one" />
      <div className="pwa-startup__glow pwa-startup__glow--two" />
      <div className="pwa-startup__content">
        <div className="pwa-startup__mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="presentation">
            <path d="M18 18h14.5C42.2 18 48 23.8 48 32s-5.8 14-15.5 14H18V18Zm10 8v12h4.1c3.7 0 5.9-2.1 5.9-6s-2.2-6-5.9-6H28Z" fill="currentColor" />
            <circle cx="46" cy="18" r="6" fill="#C9F45D" />
          </svg>
        </div>
        <p className="pwa-startup__eyebrow">Business finances, in view</p>
        <p className="pwa-startup__wordmark">dorah</p>
        <p className="pwa-startup__line">Know where your money stands.</p>
      </div>
      <span className="pwa-startup__progress" aria-hidden="true" />
    </div>
  );
}
