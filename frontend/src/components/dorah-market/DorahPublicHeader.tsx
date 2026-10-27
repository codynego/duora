'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './DorahMarketplaceHomepage.module.css';
import { usePublicAuth } from './PublicAuthContext';

const links = [
  { label: 'Features', href: '/features' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'Help', href: '/help' },
];

function Brand() {
  return <Link href="/" className={styles.brand} aria-label="Dorah home"><span className={styles.brandMark} aria-hidden="true"><span /><span /><span /></span><span>Dorah</span></Link>;
}

export default function DorahPublicHeader() {
  const { user, ready } = usePublicAuth();
  const [open, setOpen] = useState(false);
  const entryHref = user ? '/dashboard' : '/signup';
  const entryLabel = ready && user ? 'My business' : 'Get started';

  return <header className={styles.navShell}>
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Brand />
        <div className={styles.navLinks}>{links.map(({ label, href }) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div className={styles.navActions}>{user ? <Link href={entryHref} className={`${styles.button} ${styles.buttonSmall}`}>{entryLabel}</Link> : <><Link href="/login" className={styles.textLink}>Sign in</Link><Link href={entryHref} className={`${styles.button} ${styles.buttonSmall}`}>{entryLabel}</Link></>}</div>
        <div className={styles.mobileMenu}>
          <button type="button" className={styles.mobileMenuButton} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}<span className={styles.srOnly}>{open ? 'Close navigation' : 'Open navigation'}</span>
          </button>
          {open && <div id="mobile-navigation" className={styles.mobileNavPanel}>
            {links.map(({ label, href }) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight aria-hidden="true" /></Link>)}
            <div className={styles.mobileNavActions}>{user ? <Link href={entryHref} onClick={() => setOpen(false)}>My business</Link> : <><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link><Link href={entryHref} onClick={() => setOpen(false)}>Get started free</Link></>}</div>
          </div>}
        </div>
      </nav>
    </div>
  </header>;
}
