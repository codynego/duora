import Link from 'next/link';
import styles from './DorahMarketplaceHomepage.module.css';
import DorahPublicHeader from './DorahPublicHeader';
import { PublicAuthProvider } from './PublicAuthContext';

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`${styles.brand} ${light ? styles.brandLight : ''}`} aria-label="Dorah home"><span className={styles.brandMark} aria-hidden="true"><span /><span /><span /></span><span>Dorah</span></Link>;
}

export function DorahPublicFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerGrid}`}>
      <div className={styles.footerBrand}><Brand light /><p>Your AI-powered financial controller for a clearer view of your business money.</p><small>© {new Date().getFullYear()} Dorah. All rights reserved.</small></div>
      <div><strong>Product</strong><Link href="/features">Features</Link><Link href="/solutions">Solutions</Link><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/signup">Create an account</Link></div>
      <div><strong>Company</strong><Link href="/about">About Dorah</Link><Link href="/contact">Contact</Link></div>
      <div><strong>Legal</strong><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of service</Link><Link href="/security">Security and data</Link></div>
      <div><strong>Resources</strong><Link href="/resources">Finance guides</Link><Link href="/help">Help centre and FAQs</Link><Link href="/how-it-works">Getting started</Link><Link href="/install">Install Dorah</Link></div>
    </div>
  </footer>;
}

export default function DorahPublicShell({ children }: { children: React.ReactNode }) {
  return <PublicAuthProvider><div id="top" className={styles.site}><DorahPublicHeader />{children}<DorahPublicFooter /></div></PublicAuthProvider>;
}
