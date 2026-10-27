import {
  ArrowRight,
  BellRing,
  Check,
  CircleAlert,
  FileSpreadsheet,
  MessageCircle,
  Quote,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import styles from './DorahMarketplaceHomepage.module.css';
import BusinessEntryLink from './BusinessEntryLink';

const testimonials = [
  { quote: 'I wanted one place to see what came in, what I had spent, and what customers still owed me. Dorah makes that picture much easier to follow.', name: 'Shina Kapture Studio', business: 'Creative studio · Lagos' },
  { quote: 'The useful part is being able to record a partial payment and still know exactly what is left. That is the kind of detail I used to lose in my notebook.', name: 'Amina Bello', business: 'Owner, Amina’s Provision Store' },
  { quote: 'I can review supplier bills before committing cash and see which records need attention first. It gives me a calmer way to run the week.', name: 'Femi Adeyemi', business: 'Director, Northstar Foods' },
  { quote: 'Dorah helps me separate everyday business spending from money customers are still expected to pay. That makes planning the next order less stressful.', name: 'Chioma Okafor', business: 'Founder, Bloomline Events' },
];

export default function DorahMarketplaceHomepage() {
  return (
      <main id="top">
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}><span /> Financial oversight for small business</p>
              <h1>Know where your business <em>money stands.</em></h1>
              <p className={styles.heroIntro}>Track what comes in, what goes out, what you’re owed, and what needs your attention—with an AI-powered financial controller by your side.</p>
              <div className={styles.heroActions}>
                <BusinessEntryLink className={`${styles.button} ${styles.buttonCobalt}`} />
                <a href="#how-it-works" className={styles.heroTextLink}>See how it works <ArrowRight /></a>
              </div>
              <p className={styles.searchHint}>No complicated setup. Start with the records you have.</p>
            </div>

            <div className={styles.heroShelf} aria-label="Example financial overview">
              <div className={styles.shelfHeader}><span><WalletCards /> BUSINESS OVERVIEW</span><span>THIS MONTH</span></div>
              <div className={styles.financeBalance}><span>Recorded cash position</span><strong>₦2,480,000</strong><small><i /> Based on your latest records</small></div>
              <div className={styles.financeStats}>
                <div><span>Money received</span><strong>₦3,260,000</strong></div>
                <div><span>Expenses recorded</span><strong>₦1,140,000</strong></div>
              </div>
              <div className={styles.financeAlert}><span><CircleAlert /></span><div><strong>Needs a closer look</strong><small>2 transactions don’t match your expected balance</small></div><ArrowRight /></div>
              <div className={styles.shelfFooter}><ShieldCheck /> Review the records behind every insight</div>
              <span className={styles.shelfTab}>MONEY / 01</span>
            </div>
          </div>
        </section>

        <section className={styles.promiseBar} aria-label="Product principles"><div className={styles.container}><span><WalletCards /> Your records, together</span><i /><span><CircleAlert /> Changes worth reviewing</span><i /><span><ShieldCheck /> You stay in control</span></div></section>

        <section id="oversight" className={`${styles.section} ${styles.marketplace}`}>
          <div className={styles.container}>
            <header className={styles.sectionHeading}><div><p className={styles.kicker}><span /> A clearer picture</p><h2>Your finances, under control.</h2></div><p>Bring everyday business money into view so you can see what’s happening and decide what deserves your attention.</p></header>
            <div className={styles.oversightGrid}>
              <article><span><WalletCards /></span><h3>Know what you have</h3><p>See recorded cash balances, money received, expenses, customer payments due, and upcoming obligations in one place.</p></article>
              <article><span><BellRing /></span><h3>Stay on top of money owed</h3><p>Track customer debts, due dates, partial payments, and overdue balances. Know who may need a follow-up.</p></article>
              <article><span><CircleAlert /></span><h3>Catch discrepancies</h3><p>Spot duplicate entries, unmatched transactions, and unexpected changes that deserve a closer look.</p></article>
              <article><span><FileSpreadsheet /></span><h3>Understand where money goes</h3><p>See how income and expenses change over time and identify areas that may need attention.</p></article>
              <article><span><MessageCircle /></span><h3>Know what to review next</h3><p>Get plain-language guidance based on your recorded activity, from an overdue payment to an unexpected expense.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.processSection}`}>
          <div className={`${styles.container} ${styles.processGrid}`}>
            <div className={styles.processIntro}><p className={`${styles.kicker} ${styles.kickerLight}`}><span /> More than bookkeeping</p><h2>Understand what your numbers are telling you.</h2><p>Recording transactions is the start. Dorah helps connect the dots, explain changes, and point you toward records worth reviewing.</p><BusinessEntryLink className={`${styles.button} ${styles.buttonLime}`} label="Start with your records" /></div>
            <ol className={styles.steps}>
              <li><span>01</span><div><h3>Bring your financial activity together</h3><p>Record transactions, enter opening balances, or import supported financial records.</p></div><FileSpreadsheet /></li>
              <li><span>02</span><div><h3>See what stands out</h3><p>Review organized records, outstanding payments, and changes that may need attention.</p></div><CircleAlert /></li>
              <li><span>03</span><div><h3>Understand the evidence</h3><p>Explore the records behind an alert or recommendation before deciding what to do.</p></div><ShieldCheck /></li>
              <li><span>04</span><div><h3>Take your next step</h3><p>Follow up on debts, investigate discrepancies, and keep important obligations in view.</p></div><ArrowRight /></li>
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.twoWaysSection}`}>
          <div className={styles.container}>
            <p className={styles.kicker}><span /> Ask about your records</p>
            <div className={styles.twoWaysHeading}><h2>Get answers without digging through rows.</h2><p>Ask questions about the financial information you’ve recorded. Dorah explains what it can see and makes gaps clear when information is incomplete.</p></div>
            <div className={styles.questionPanel}>
              <div className={styles.questionPanelHead}><span><MessageCircle /> DORAH / FINANCE ASSISTANT</span><span>YOUR BUSINESS RECORDS</span></div>
              <div className={styles.questionList}><p>Which customers owe my business the most?</p><p>What payments are overdue?</p><p>Why doesn’t my recorded cash balance match the expected balance?</p><p>Which expenses have increased this month?</p><p>What should I review first?</p></div>
              <div className={styles.questionFoot}><ShieldCheck /> Answers are based on the financial records available to your business.</div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.testimonialSection}`}>
          <div className={styles.container}>
            <header className={styles.sectionHeading}><div><p className={styles.kicker}><span /> From the owner’s side</p><h2>Built for the decisions behind the numbers.</h2></div><p>Dorah is designed for the everyday moments when a business owner needs a clearer answer, not another complicated report.</p></header>
            <div className={styles.testimonialViewport} tabIndex={0} aria-label="Customer testimonials">
              <div className={styles.testimonialGrid}>
                {[...testimonials, ...testimonials].map((testimonial, index) => <article key={`${testimonial.name}-${index}`} className={styles.testimonialCard} aria-hidden={index >= testimonials.length}><Quote className={styles.testimonialQuoteIcon} /><blockquote>“{testimonial.quote}”</blockquote><footer><strong>{testimonial.name}</strong><span>{testimonial.business}</span></footer></article>)}
              </div>
            </div>
            <p className={styles.testimonialNote}>Early feedback from small-business owners building better financial habits.</p>
          </div>
        </section>

        <section id="how-it-works" className={`${styles.section} ${styles.trustSection}`}>
          <div className={`${styles.container} ${styles.trustGrid}`}><div><p className={styles.kicker}><span /> Built for the real work</p><h2>Start with what you have. Get clearer as you go.</h2><p className={styles.trustIntro}>You don’t need an accounting department or perfect records to begin. Build a more complete financial picture over time, one transaction at a time.</p></div><div className={styles.trustPoints}><article><FileSpreadsheet /><h3>Bring existing records</h3><p>Start from scratch or import supported spreadsheets and build from the information you already have.</p></article><article><ShieldCheck /><h3>Review before acting</h3><p>Discrepancies are signals to investigate, not proof of fraud. Your records stay visible behind each insight.</p></article><article><Check /><h3>Work alongside your accountant</h3><p>Keep better organized records. Dorah supports financial oversight; it doesn’t replace professional accounting advice.</p></article></div></div>
        </section>

        <section className={styles.finalCta}><div className={`${styles.container} ${styles.finalInner}`}><div><p className={`${styles.kicker} ${styles.kickerLight}`}><span /> A clearer financial picture</p><h2>Know what came in.<br />Know what needs attention.</h2></div><div><p>Bring your business money into view and make your next decision with better context.</p><BusinessEntryLink className={`${styles.button} ${styles.buttonLime}`} /></div></div></section>
      </main>
  );
}
