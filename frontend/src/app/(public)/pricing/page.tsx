import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, CircleHelp, FileSpreadsheet, MessageCircle, ShieldCheck, WalletCards } from 'lucide-react';
import styles from '@/components/dorah-market/DorahMarketplaceHomepage.module.css';
import { publicPageMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Pricing', description: 'Compare Dorah Free, Control, and Intelligence plans for small-business financial oversight. Review monthly and annual prices and choose a plan.', path: '/pricing' });

const freeFeatures = [
  '1 business',
  '100 new transactions each month',
  '20 customer records and 10 supplier records',
  'Basic financial dashboard and debt tracking',
  '1 spreadsheet import each month',
  '5 AI questions each month',
  'Basic discrepancy checks',
];

const controlFeatures = [
  'Everything in Free',
  'Unlimited transaction recording',
  'Unlimited spreadsheet imports',
  'Reconciliation tools and full financial reports',
  '50 AI questions each month',
];

const intelligenceFeatures = [
  'Everything in Control',
  'Advanced financial monitoring',
  'AI-powered explanations and recommendations',
  '200 AI questions each month',
  'Team permissions',
];

export default function PricingPage() {
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/pricing#plans`,
    name: 'Dorah plans',
    url: `${SITE_URL}/pricing`,
    itemListElement: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: '100 transactions and 5 AI questions each month.' },
      { '@type': 'Offer', name: 'Control', price: '3.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: 'Unlimited transaction recording and 50 AI questions each month.' },
      { '@type': 'Offer', name: 'Intelligence', price: '7.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: 'Advanced financial monitoring and 200 AI questions each month.' },
    ],
  };
  return (
      <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema).replace(/</g, '\\u003c') }} /><main>
        <section className={styles.pricingHero}><div className={styles.container}><p className={styles.kicker}><span /> Straightforward plans</p><h1>Start free.<br /><em>Grow with clarity.</em></h1><p>Get a useful view of your business finances at no cost. Choose Control for more room to record and report, or Intelligence for deeper monitoring and team permissions.</p><div className={styles.pricingCurrency}><WalletCards /> Prices shown in USD. If you pay in naira, your provider’s exchange rate may vary.</div></div></section>

        <section className={styles.pricingSection}><div className={styles.container}>
          <div className={styles.planGrid}>
            <article className={styles.planCard}>
              <div className={styles.planHeading}><div><p>For getting started</p><h2>Free</h2></div><span className={styles.planBadge}>$0 always</span></div>
              <p className={styles.planDescription}>Build a clearer picture of your business money using the records you have.</p>
              <div className={styles.planPrice}><strong>$0</strong><span>/ month</span></div>
              <Link href="/signup" className={`${styles.button} ${styles.planButton}`}>Get started free <ArrowRight /></Link>
              <p className={styles.includedLabel}>Free includes</p>
              <ul className={styles.planFeatures}>{freeFeatures.map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
            </article>

            <article className={`${styles.planCard} ${styles.controlPlan}`}>
              <div className={styles.planHeading}><div><p>For growing records</p><h2>Control</h2></div><span className={styles.planBadge}>Most room</span></div>
              <p className={styles.planDescription}>Keep recording and importing without transaction or import caps, with 50 controller questions each month.</p>
              <div className={styles.planPrice}><strong>$3.99</strong><span>/ month</span></div>
              <div className={styles.annualPrice}>Or $39.99 / year <span>Save about 16%</span></div>
              <Link href="/signup" className={`${styles.button} ${styles.controlButton}`}>Choose Control <ArrowRight /></Link>
              <p className={styles.includedLabel}>Everything in Free, plus</p>
              <ul className={styles.planFeatures}>{controlFeatures.slice(1).map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
            </article>

            <article className={styles.planCard}>
              <div className={styles.planHeading}><div><p>For deeper oversight</p><h2>Intelligence</h2></div><span className={styles.planBadge}>Advanced insights</span></div>
              <p className={styles.planDescription}>Understand what changed, why it matters, and what may deserve a closer look.</p>
              <div className={styles.planPrice}><strong>$7.99</strong><span>/ month</span></div>
              <div className={styles.annualPrice}>Or $79.99 / year <span>Save about 17%</span></div>
              <Link href="/signup" className={`${styles.button} ${styles.controlButton}`}>Choose Intelligence <ArrowRight /></Link>
              <p className={styles.includedLabel}>Everything in Control, plus</p>
              <ul className={styles.planFeatures}>{intelligenceFeatures.slice(1).map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
            </article>
          </div>
          <p className={styles.launchNote}><ShieldCheck /> Start with the plan that fits your records today. You can move to deeper financial monitoring and team tools as your business grows.</p>
        </div></section>

        <section className={styles.compareSection}><div className={styles.container}><header className={styles.sectionHeading}><div><p className={styles.kicker}><span /> Compare plans</p><h2>Room to build better habits.</h2></div><p>Choose the plan that fits how much financial activity you want to keep in view.</p></header><div className={styles.compareTable} role="table" aria-label="Free, Control, and Intelligence plan comparison"><div className={`${styles.compareRow} ${styles.compareHead}`} role="row"><span role="columnheader">Included</span><strong role="columnheader">Free</strong><strong role="columnheader">Control</strong><strong role="columnheader">Intelligence</strong></div>
            {[
              ['Businesses', '1', '1', '1'],
              ['New transactions', '100 / month', 'Unlimited', 'Unlimited'],
              ['Customer records', '20', '20', '20'],
              ['Supplier records', '10', '10', '10'],
              ['Spreadsheet imports', '1 / month', 'Unlimited', 'Unlimited'],
              ['AI questions', '5 / month', '50 / month', '200 / month'],
              ['Financial reports', 'Basic', 'Full reports', 'Full reports'],
              ['Reconciliation tools', '—', 'Included', 'Included'],
              ['Discrepancy checks', 'Basic', 'Included', 'Advanced monitoring'],
              ['AI explanations and recommendations', '—', '—', 'Included'],
              ['Team permissions', '—', '—', 'Included'],
            ].map(([feature, free, control, intelligence]) => <div className={styles.compareRow} role="row" key={feature}><span role="rowheader">{feature}</span><span role="cell">{free}</span><span role="cell">{control}</span><span role="cell">{intelligence}</span></div>)}
          </div></div></section>

        <section id="pricing-faq" className={styles.pricingFaq}><div className={styles.container}><header className={styles.sectionHeading}><div><p className={styles.kicker}><span /> Good to know</p><h2>Questions about pricing?</h2></div></header><div className={styles.faqGrid}><article><CircleHelp /><h3>Can I start without organized records?</h3><p>Yes. Begin with opening balances and new activity, or import supported records. Your financial picture builds as your records do.</p></article><article><MessageCircle /><h3>What happens when I reach a Free limit?</h3><p>You can continue reviewing your existing records. Control gives you more room for new transactions, imports, reports, and AI questions.</p></article><article><FileSpreadsheet /><h3>Are prices converted to naira?</h3><p>Prices here are in USD. A rough conversion of $1 to ₦1,350 is only an estimate; your payment provider’s rate and charges can differ.</p></article></div></div></section>

        <section className={styles.finalCta}><div className={`${styles.container} ${styles.finalInner}`}><div><p className={`${styles.kicker} ${styles.kickerLight}`}><span /> Begin with the records you have</p><h2>Get clearer about where you stand.</h2></div><div><p>Start free and bring your business money into view.</p><Link href="/signup" className={`${styles.button} ${styles.buttonLime}`}>Get started free <ArrowRight /></Link></div></div></section>
      </main></>
  );
}
