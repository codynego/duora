'use client';

import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
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
  const entryHref = user ? '/dashboard' : '/signup';
  const entryLabel = ready && user ? 'My business' : 'Get started';

  return <header className={styles.navShell}>
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Brand />
        <div className={styles.navLinks}>{links.map(({ label, href }) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div className={styles.navActions}>{user ? <Link href={entryHref} className={`${styles.button} ${styles.buttonSmall}`}>{entryLabel}</Link> : <><Link href="/login" className={styles.textLink}>Sign in</Link><Link href={entryHref} className={`${styles.button} ${styles.buttonSmall}`}>{entryLabel}</Link></>}</div>
        <details className={styles.mobileMenu}>
          <summary aria-label="Open navigation"><Menu aria-hidden="true" /><span className={styles.srOnly}>Open navigation</span></summary>
          <div className={styles.mobileNavPanel}>
            {links.map(({ label, href }) => <Link key={href} href={href}>{label}<ArrowRight aria-hidden="true" /></Link>)}
            <div className={styles.mobileNavActions}>{user ? <Link href={entryHref}>My business</Link> : <><Link href="/login">Sign in</Link><Link href={entryHref}>Get started free</Link></>}</div>
          </div>
        </details>
      </nav>
    </div>
  </header>;
}
