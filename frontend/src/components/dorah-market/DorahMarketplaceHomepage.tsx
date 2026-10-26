'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  CircleDollarSign,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import styles from './DorahMarketplaceHomepage.module.css';

type Subscription = {
  name: string;
  category: 'Creative' | 'AI' | 'Productivity' | 'Learning';
  mark: string;
  tone: string;
  price: number;
  directPrice: number;
  seats: number;
  access: string;
};

const subscriptions: Subscription[] = [
  { name: 'Canva Teams', category: 'Creative', mark: 'Ca', tone: '#8058ff', price: 2900, directPrice: 7500, seats: 3, access: 'Team invitation' },
  { name: 'ChatGPT Team', category: 'AI', mark: 'AI', tone: '#0b8f70', price: 12500, directPrice: 32000, seats: 2, access: 'Workspace seat' },
  { name: 'Microsoft 365', category: 'Productivity', mark: 'M', tone: '#ef6c35', price: 2400, directPrice: 8200, seats: 4, access: 'Family invitation' },
  { name: 'MasterClass', category: 'Learning', mark: 'M+', tone: '#b3262e', price: 3200, directPrice: 10000, seats: 2, access: 'Member profile' },
];

const categories = ['All', 'Creative', 'AI', 'Productivity', 'Learning'] as const;

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className={`${styles.brand} ${light ? styles.brandLight : ''}`} aria-label="Dorah home">
      <span className={styles.brandMark} aria-hidden="true"><span /><span /><span /></span>
      <span>Dorah</span>
    </a>
  );
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const saved = subscription.directPrice - subscription.price;
  return (
    <article className={styles.subscriptionCard}>
      <div className={styles.cardTopline}>
        <span className={styles.serviceMark} style={{ '--service-color': subscription.tone } as React.CSSProperties}>{subscription.mark}</span>
        <span className={styles.seatCount}><span /> {subscription.seats} seats open</span>
      </div>
      <div className={styles.cardBody}>
        <p>{subscription.category}</p>
        <h3>{subscription.name}</h3>
        <span className={styles.accessType}><BadgeCheck /> {subscription.access}</span>
      </div>
      <div className={styles.priceRow}>
        <div><strong>{formatNaira(subscription.price)}</strong><span>/ month</span></div>
        <p>Save {formatNaira(saved)}</p>
      </div>
      <Link href="/signup" className={styles.cardAction}>View open seats <ArrowRight /></Link>
    </article>
  );
}

export default function DorahMarketplaceHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [query, setQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const visibleSubscriptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return subscriptions.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery = !normalized || `${item.name} ${item.category}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchMessage(query.trim() ? `${visibleSubscriptions.length} matching preview ${visibleSubscriptions.length === 1 ? 'offer' : 'offers'} below.` : 'Browse the featured preview offers below.');
    document.querySelector('#subscriptions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div id="top" className={styles.site}>
      <header className={styles.navShell}>
        <div className={styles.container}>
          <nav className={styles.nav} aria-label="Primary navigation">
            <Brand />
            <div className={styles.navLinks}>
              <a href="#subscriptions">Marketplace</a><a href="#how-it-works">How it works</a><a href="#manage">Manage subscriptions</a><a href="#trust">Safety</a>
            </div>
            <div className={styles.navActions}>
              <Link href="/login" className={styles.textLink}>Sign in</Link>
              <Link href="/signup" className={`${styles.button} ${styles.buttonSmall}`}>Create account</Link>
            </div>
            <button className={styles.menuButton} type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
          </nav>
          {menuOpen && <nav className={styles.mobileNav} aria-label="Mobile navigation"><a href="#subscriptions" onClick={() => setMenuOpen(false)}>Marketplace</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#manage" onClick={() => setMenuOpen(false)}>Manage subscriptions</a><a href="#trust" onClick={() => setMenuOpen(false)}>Safety</a><Link href="/login">Sign in</Link><Link href="/signup" className={styles.button}>Create account</Link></nav>}
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}><span /> Your digital life, minus the full bill</p>
              <h1>Pay for the <em>seat.</em><br />Not the whole plan.</h1>
              <p className={styles.heroIntro}>Find eligible access to the tools you already want, split the cost with verified people, and keep every renewal in one calm place.</p>
              <form className={styles.searchBox} onSubmit={handleSearch} role="search">
                <Search aria-hidden="true" /><label className={styles.srOnly} htmlFor="subscription-search">Search subscriptions</label>
                <input id="subscription-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Canva, ChatGPT, Microsoft…" />
                <button type="submit">Find a seat <ArrowRight /></button>
              </form>
              <p className={styles.searchHint} aria-live="polite">{searchMessage || 'No card needed to browse · Clear renewal terms before you pay'}</p>
            </div>

            <div className={styles.heroShelf} aria-label="Example subscription group">
              <div className={styles.shelfHeader}><span><UsersRound /> LIVE GROUP</span><span>03 / 04 seats</span></div>
              <div className={styles.shelfService}><span className={styles.heroServiceMark}>Ca</span><div><p>Canva Teams</p><span>Renews 14 November</span></div><BadgeCheck aria-label="Verified access method" /></div>
              <div className={styles.seatRail} aria-label="Three of four seats filled"><span className={styles.filledSeat}>YO</span><span className={styles.filledSeat}>AO</span><span className={styles.filledSeat}>TM</span><span className={styles.openSeat}><Plus /><small>OPEN</small></span></div>
              <div className={styles.shelfReceipt}><p><span>Your seat</span><strong>₦2,900</strong></p><p><span>Service fee</span><strong>Shown at checkout</strong></p><p className={styles.shelfTotal}><span>Next payment</span><strong>₦2,900 + fee</strong></p></div>
              <div className={styles.shelfFooter}><ShieldCheck /> Access method reviewed by Dorah</div><span className={styles.shelfTab}>SHARE 01</span>
            </div>
          </div>
        </section>

        <section className={styles.promiseBar} aria-label="Dorah product principles"><div className={styles.container}><span><BadgeCheck /> Eligible access methods</span><i /><span><WalletCards /> Local payments</span><i /><span><BellRing /> Renewal reminders</span></div></section>

        <section id="subscriptions" className={`${styles.section} ${styles.marketplace}`}>
          <div className={styles.container}>
            <header className={styles.sectionHeading}><div><p className={styles.kicker}><span /> Open now</p><h2>Tools worth sharing.<br />Terms worth seeing.</h2></div><p>Every offer shows what you receive, how access is provided, what renews, and how many seats remain.</p></header>
            <div className={styles.categoryRow} aria-label="Filter subscriptions">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
            {visibleSubscriptions.length ? <div className={styles.subscriptionGrid}>{visibleSubscriptions.map((subscription) => <SubscriptionCard key={subscription.name} subscription={subscription} />)}</div> : <div className={styles.emptyState}><Search /><h3>No preview offers match that search.</h3><p>Try another service name or reset the category filter.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); }}>Show all offers</button></div>}
            <p className={styles.previewNote}>Preview catalog and indicative prices for the homepage concept. Final offers will come from reviewed listings.</p>
          </div>
        </section>

        <section id="how-it-works" className={`${styles.section} ${styles.processSection}`}>
          <div className={`${styles.container} ${styles.processGrid}`}>
            <div className={styles.processIntro}><p className={`${styles.kicker} ${styles.kickerLight}`}><span /> From search to seat</p><h2>Know exactly what happens next.</h2><p>No vague handoffs. Dorah keeps the offer, payment, activation, and renewal connected.</p><Link href="/signup" className={`${styles.button} ${styles.buttonLime}`}>Browse subscriptions <ArrowRight /></Link></div>
            <ol className={styles.steps}>
              <li><span>01</span><div><h3>Choose an open seat</h3><p>Compare the price, access method, renewal date, and group availability before paying.</p></div><Search /></li>
              <li><span>02</span><div><h3>Pay your share</h3><p>Checkout records exactly what you purchased and when the next payment is due.</p></div><WalletCards /></li>
              <li><span>03</span><div><h3>Get invited in</h3><p>The seller provisions your approved invitation, profile, or workspace seat.</p></div><BadgeCheck /></li>
              <li><span>04</span><div><h3>Stay in control</h3><p>See renewals, report access problems, or leave before the next billing cycle.</p></div><BellRing /></li>
            </ol>
          </div>
        </section>

        <section id="share" className={`${styles.section} ${styles.twoWaysSection}`}>
          <div className={styles.container}>
            <p className={styles.kicker}><span /> One marketplace, two wins</p><div className={styles.twoWaysHeading}><h2>Spend less.<br />Recover more.</h2><p>Join a group when you need access. List eligible empty seats when you already have them.</p></div>
            <div className={styles.twoWays}>
              <article className={styles.buyerPath}><span className={styles.pathLabel}>I NEED A TOOL</span><div className={styles.pathIcon}><Sparkles /></div><h3>Join and save</h3><p>Pay only for the access you use, with the group terms visible before checkout.</p><ul><li><Check /> Browse verified offers</li><li><Check /> Pay in naira</li><li><Check /> Leave before renewal</li></ul><Link href="/signup">Find an open seat <ArrowRight /></Link></article>
              <article className={styles.sellerPath}><span className={styles.pathLabel}>I HAVE EMPTY SEATS</span><div className={styles.pathIcon}><CircleDollarSign /></div><h3>Share and recover</h3><p>List eligible capacity, collect member payments, and keep your group organized.</p><ul><li><Check /> Set available capacity</li><li><Check /> Track members and renewals</li><li><Check /> See payouts clearly</li></ul><Link href="/signup">List your seats <ArrowRight /></Link></article>
            </div>
          </div>
        </section>

        <section id="manage" className={`${styles.section} ${styles.managerSection}`}>
          <div className={`${styles.container} ${styles.managerGrid}`}>
            <div className={styles.managerBoard} aria-label="Subscription management preview">
              <header><div><span>DORAH / MY SUBSCRIPTIONS</span><h3>November</h3></div><button type="button" aria-label="Add a subscription"><Plus /> Add</button></header>
              <div className={styles.managerSummary}><span>Due this month</span><strong>₦17,800</strong><small>across 3 subscriptions</small></div>
              <div className={styles.timeline}>
                <article><time>08</time><span className={styles.miniMark} style={{ '--service-color': '#ef6c35' } as React.CSSProperties}>M</span><div><strong>Microsoft 365</strong><small>Marketplace seat</small></div><b>₦2,400</b></article>
                <article><time>14</time><span className={styles.miniMark} style={{ '--service-color': '#8058ff' } as React.CSSProperties}>Ca</span><div><strong>Canva Teams</strong><small>Marketplace seat</small></div><b>₦2,900</b></article>
                <article><time>27</time><span className={styles.miniMark} style={{ '--service-color': '#0b8f70' } as React.CSSProperties}>AI</span><div><strong>ChatGPT Team</strong><small>Marketplace seat</small></div><b>₦12,500</b></article>
              </div><footer><BellRing /><span>Next reminder</span><strong>5 November</strong></footer>
            </div>
            <div className={styles.managerCopy}><p className={styles.kicker}><span /> Beyond the marketplace</p><h2>Every renewal.<br />One clear view.</h2><p>Add subscriptions you pay for elsewhere alongside your Dorah purchases. See upcoming charges and decide what stays before money leaves your account.</p><ul><li><span><BellRing /></span><div><strong>Timely reminders</strong><p>Get a useful heads-up before the renewal date.</p></div></li><li><span><WalletCards /></span><div><strong>True monthly spend</strong><p>See marketplace and personal subscriptions together.</p></div></li></ul></div>
          </div>
        </section>

        <section id="trust" className={`${styles.section} ${styles.trustSection}`}><div className={`${styles.container} ${styles.trustGrid}`}><div><p className={styles.kicker}><span /> Trust is the product</p><h2>Sharing should never mean guessing.</h2></div><div className={styles.trustPoints}><article><BadgeCheck /><h3>Reviewed access</h3><p>Listings state how access is supplied. Dorah prioritizes invitations, seats, and permitted profiles.</p></article><article><ShieldCheck /><h3>No public passwords</h3><p>Credentials never appear in marketplace listings, and password sharing is not the default.</p></article><article><WalletCards /><h3>Clear payment records</h3><p>Prices, renewal terms, cancellations, and transaction history stay visible from your account.</p></article></div></div></section>

        <section className={styles.finalCta}><div className={`${styles.container} ${styles.finalInner}`}><div><p className={`${styles.kicker} ${styles.kickerLight}`}><span /> Your next subscription</p><h2>Take the seat.<br />Leave the full bill.</h2></div><div><p>Start with one tool you already need. Dorah keeps the access, payment, and renewal in view.</p><Link href="/signup" className={`${styles.button} ${styles.buttonLime}`}>Create your account <ArrowRight /></Link></div></div></section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerGrid}`}><div><Brand light /><p>Affordable digital access, organized.</p></div><div><strong>Explore</strong><a href="#subscriptions">Marketplace</a><a href="#how-it-works">How it works</a><a href="#manage">Subscription manager</a></div><div><strong>Company</strong><Link href="/safety">Safety</Link><Link href="/help">Help</Link><Link href="/contact">Contact</Link></div><div><strong>Legal</strong><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><p>© {new Date().getFullYear()} Dorah</p></div></div></footer>
    </div>
  );
}
