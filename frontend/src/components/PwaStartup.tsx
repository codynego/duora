'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PwaStartup() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'leaving'>('hidden');

  useEffect(() => {
    const storageKey = 'duorah-startup-seen';
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, 'true');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase('entering');
    const leaveTimer = window.setTimeout(() => setPhase('leaving'), reducedMotion ? 80 : 1050);
    const hideTimer = window.setTimeout(() => setPhase('hidden'), reducedMotion ? 160 : 1350);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === 'hidden' || pathname === '/') return null;

  return (
    <div className={`pwa-startup pwa-startup--${phase}`} role="status" aria-live="polite" aria-label="Opening Dorah">
      <div className="pwa-startup__glow pwa-startup__glow--one" />
      <div className="pwa-startup__glow pwa-startup__glow--two" />
      <div className="pwa-startup__content">
        <div className="pwa-startup__mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="presentation">
            <path d="M18 18h14.5C42.2 18 48 23.8 48 32s-5.8 14-15.5 14H18V18Zm10 8v12h4.1c3.7 0 5.9-2.1 5.9-6s-2.2-6-5.9-6H28Z" fill="currentColor" />
            <circle cx="46" cy="18" r="6" fill="#7454A6" />
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
