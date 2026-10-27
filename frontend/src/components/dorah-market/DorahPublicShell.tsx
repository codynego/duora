import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import styles from './DorahMarketplaceHomepage.module.css';

const links = [
  { label: 'Features', href: '/features' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'Help', href: '/help' },
];

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`${styles.brand} ${light ? styles.brandLight : ''}`} aria-label="Dorah home"><span className={styles.brandMark} aria-hidden="true"><span /><span /><span /></span><span>Dorah</span></Link>;
}

export function DorahPublicHeader() {
  return <header className={styles.navShell}>
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Brand />
        <div className={styles.navLinks}>{links.map(({ label, href }) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div className={styles.navActions}><Link href="/login" className={styles.textLink}>Sign in</Link><Link href="/signup" className={`${styles.button} ${styles.buttonSmall}`}>Get started</Link></div>
        <details className={styles.mobileMenu}>
          <summary aria-label="Open navigation"><Menu aria-hidden="true" /><span className={styles.srOnly}>Open navigation</span></summary>
          <div className={styles.mobileNavPanel}>
            {links.map(({ label, href }) => <Link key={href} href={href}>{label}<ArrowRight aria-hidden="true" /></Link>)}
            <div className={styles.mobileNavActions}><Link href="/login">Sign in</Link><Link href="/signup">Get started free</Link></div>
          </div>
        </details>
      </nav>
    </div>
  </header>;
}

export function DorahPublicFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerGrid}`}>
      <div className={styles.footerBrand}><Brand light /><p>Your AI-powered financial controller for a clearer view of your business money.</p><small>© {new Date().getFullYear()} Dorah. All rights reserved.</small></div>
      <div><strong>Product</strong><Link href="/features">Features</Link><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/signup">Create an account</Link></div>
      <div><strong>Company</strong><Link href="/about">About Dorah</Link><Link href="/contact">Contact</Link></div>
      <div><strong>Legal</strong><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of service</Link><Link href="/security">Security and data</Link></div>
      <div><strong>Resources</strong><Link href="/help">Help centre and FAQs</Link><Link href="/how-it-works">Getting started</Link></div>
    </div>
  </footer>;
}

export default function DorahPublicShell({ children }: { children: React.ReactNode }) {
  return <div id="top" className={styles.site}><DorahPublicHeader />{children}<DorahPublicFooter /></div>;
}
