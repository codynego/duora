import Link from 'next/link';
import styles from './DorahMarketplaceHomepage.module.css';
import DorahPublicHeader from './DorahPublicHeader';
import { PublicAuthProvider } from './PublicAuthContext';
import DorahLogo from '@/components/DorahLogo';

export function DorahPublicFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerGrid}`}>
      <div className={styles.footerBrand}><DorahLogo light className={styles.brand} /><p>Your AI-powered financial controller for a clearer view of your business money.</p><small>© {new Date().getFullYear()} Dorah. All rights reserved.</small></div>
      <div><strong>Product</strong><Link href="/financial-controller">Financial controller</Link><Link href="/features">Features</Link><Link href="/financial-intelligence">Financial Intelligence</Link><Link href="/text-to-transaction">Text to transaction</Link><Link href="/product-tour">Product tour</Link><Link href="/pricing">Pricing</Link></div>
      <div><strong>Solutions</strong><Link href="/solutions">Business solutions</Link><Link href="/customer-debt-tracking">Customer debt tracking</Link><Link href="/cash-account-tracking">Cash and accounts</Link><Link href="/how-it-works">How Dorah works</Link><Link href="/install">Install Dorah</Link></div>
      <div><strong>Trust</strong><Link href="/ai-transparency">AI transparency</Link><Link href="/security">Security and data</Link><Link href="/privacy">Privacy policy</Link><Link href="/data-and-account-management">Data and account management</Link><Link href="/terms">Terms of service</Link></div>
      <div><strong>Resources</strong><Link href="/resources">Small-business finance guides</Link><Link href="/help">Dorah how-to guides</Link><Link href="/billing-and-limits">Plan limits and billing</Link><Link href="/about">About Dorah</Link><Link href="/contact">Contact support</Link></div>
    </div>
  </footer>;
}

export default function DorahPublicShell({ children }: { children: React.ReactNode }) {
  return <PublicAuthProvider><div id="top" className={styles.site}><DorahPublicHeader />{children}<DorahPublicFooter /></div></PublicAuthProvider>;
}
