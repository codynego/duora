'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock3,
  Home,
  KeyRound,
  MapPin,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

const homes = [
  {
    title: 'Light-filled 2 bedroom flat',
    location: 'GRA, Benin City',
    price: '₦800,000',
    total: '₦980,000 total to move in',
    confirmed: 'Confirmed today',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=82',
    alt: 'Modern two-storey residential home',
  },
  {
    title: 'Private room in a shared flat',
    location: 'Ugbowo, Benin City',
    price: '₦250,000',
    total: '₦310,000 total to move in',
    confirmed: 'Confirmed yesterday',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82',
    alt: 'Bright private bedroom with neutral furnishing',
  },
  {
    title: 'Compact mini flat',
    location: 'Airport Road, Benin City',
    price: '₦600,000',
    total: '₦720,000 total to move in',
    confirmed: 'Confirmed 2 days ago',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=82',
    alt: 'Contemporary apartment living space',
  },
];

const navLinks = [
  ['Homes', '#homes'],
  ['Roommates', '#roommates'],
  ['Share a vacancy', '#share'],
  ['How it works', '#how-it-works'],
];

function Brand() {
  return (
    <a href="#top" className="homi-brand" aria-label="Homi.ng home">
      <span className="homi-brand-mark" aria-hidden="true"><Home /></span>
      <span>Homi<span>.ng</span></span>
    </a>
  );
}

export default function HomiHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'home' | 'room'>('home');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [searchNote, setSearchNote] = useState('');

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location.trim()) {
      setSearchNote('Enter an area or landmark to start your search.');
      return;
    }
    setSearchNote(`Search ready for ${searchMode === 'home' ? 'homes' : 'rooms'} around ${location.trim()}${budget ? ` within ${budget}` : ''}.`);
  }

  return (
    <div id="top" className="homi-site">
      <header className="homi-nav-wrap">
        <div className="homi-container homi-nav">
          <Brand />
          <nav className="homi-nav-links" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="homi-nav-actions">
            <Link href="/login" className="homi-text-link">Sign in</Link>
            <Link href="/signup" className="homi-button homi-button--small">Create account</Link>
          </div>
          <button type="button" className="homi-menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="homi-mobile-nav" aria-label="Mobile navigation">
            {navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/signup" className="homi-button" onClick={() => setMenuOpen(false)}>Create account</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="homi-hero">
          <div className="homi-container homi-hero-grid">
            <div className="homi-hero-copy">
              <p className="homi-kicker"><span /> Recently confirmed homes</p>
              <h1>Find homes that are <em>still available.</em></h1>
              <p className="homi-hero-intro">Search fresh vacancies, see the full amount needed to move in, and speak directly with the person responsible for the home.</p>

              <div className="homi-search-shell">
                <div className="homi-search-tabs" role="tablist" aria-label="Search type">
                  <button type="button" role="tab" aria-selected={searchMode === 'home'} onClick={() => setSearchMode('home')}><KeyRound /> Rent a home</button>
                  <button type="button" role="tab" aria-selected={searchMode === 'room'} onClick={() => setSearchMode('room')}><UsersRound /> Find a room</button>
                </div>
                <form className="homi-search-form" onSubmit={handleSearch} noValidate>
                  <label className="homi-search-field">
                    <span>Where do you want to live?</span>
                    <span className="homi-field-row">
                      <MapPin />
                      <input value={location} onChange={(event) => { setLocation(event.target.value); setSearchNote(''); }} placeholder="e.g. Yaba or Ring Road" aria-describedby="search-feedback" />
                    </span>
                  </label>
                  <label className="homi-search-field homi-search-field--budget">
                    <span>Maximum annual rent</span>
                    <span className="homi-field-row">
                      <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                        <option value="">Any budget</option>
                        <option value="₦400,000">₦400,000</option>
                        <option value="₦800,000">₦800,000</option>
                        <option value="₦1,200,000">₦1,200,000</option>
                        <option value="₦2,000,000">₦2,000,000</option>
                      </select>
                      <ChevronDown />
                    </span>
                  </label>
                  <button type="submit" className="homi-search-button"><Search /> Search</button>
                </form>
                <p id="search-feedback" className={`homi-search-feedback ${searchNote ? 'is-visible' : ''}`} aria-live="polite">{searchNote || 'Search by the neighbourhoods and landmarks you already know.'}</p>
              </div>

              <ul className="homi-proof-list" aria-label="Homi listing standards">
                <li><Clock3 /> Freshness shown</li>
                <li><ReceiptText /> Full costs upfront</li>
                <li><ShieldCheck /> Contact checked</li>
              </ul>
            </div>

            <div className="homi-vacancy-stage" aria-label="Example verified vacancy record">
              <div className="homi-stage-photo" role="img" aria-label="Modern apartment building exterior" />
              <div className="homi-stage-stamp"><BadgeCheck /> Confirmed today</div>
              <div className="homi-stage-caption">
                <div><p>2 bedroom flat</p><span><MapPin /> GRA, Benin City</span></div>
                <strong>₦800k <small>/ year</small></strong>
              </div>
              <div className="homi-cost-card">
                <div className="homi-record-spine">VACANCY RECORD</div>
                <p className="homi-cost-eyebrow">What you actually need</p>
                <div><span>Annual rent</span><strong>₦800,000</strong></div>
                <div><span>Caution deposit</span><strong>₦80,000</strong></div>
                <div><span>Legal & agreement</span><strong>₦100,000</strong></div>
                <div className="homi-cost-zero"><span>Agent fee</span><strong>₦0</strong></div>
                <footer><span>Total to move in</span><strong>₦980,000</strong></footer>
              </div>
            </div>
          </div>
        </section>

        <section className="homi-marquee" aria-label="Homi product promise">
          <div className="homi-container"><span>Fresh vacancy information</span><i /><span>No mystery charges</span><i /><span>No paying to inspect a home</span></div>
        </section>

        <section id="homes" className="homi-section homi-homes">
          <div className="homi-container">
            <header className="homi-section-heading">
              <div><p className="homi-kicker"><span /> Browse with context</p><h2>Don’t just see the rent.<br />See the whole move.</h2></div>
              <p>Every preview shows when availability was last checked and the estimated total needed before you collect the keys.</p>
            </header>
            <div className="homi-home-grid">
              {homes.map((home) => (
                <article className="homi-home-card" key={home.title}>
                  <div className="homi-home-image-wrap">
                    {/* This is lightweight preview content; production listing media should move to next/image once the API supplies stable image hosts. */}
                    <img src={home.image} alt={home.alt} loading="lazy" />
                    <span><BadgeCheck /> {home.confirmed}</span>
                  </div>
                  <div className="homi-home-copy">
                    <p className="homi-home-location"><MapPin /> {home.location}</p>
                    <h3>{home.title}</h3>
                    <div className="homi-home-price"><strong>{home.price}<small> / year</small></strong><span>{home.total}</span></div>
                  </div>
                </article>
              ))}
            </div>
            <div className="homi-centered-action"><Link href="/signup" className="homi-button">See available homes <ArrowRight /></Link><p>Example listings shown for product preview.</p></div>
          </div>
        </section>

        <section id="how-it-works" className="homi-section homi-record-section">
          <div className="homi-container homi-record-grid">
            <div className="homi-record-copy">
              <p className="homi-kicker homi-kicker--light"><span /> Our verification standard</p>
              <h2>A listing is only useful while it’s true.</h2>
              <p>Homi records who shared each vacancy, who can authorize a viewing, and when the details were last confirmed. Old information expires instead of lingering forever.</p>
              <Link href="/safety" className="homi-inline-link">Learn how verification works <ArrowRight /></Link>
            </div>
            <ol className="homi-record-steps">
              <li><span>01</span><div><h3>Vacancy shared</h3><p>An owner, outgoing tenant, or trusted local source tells us a home is opening up.</p></div></li>
              <li><span>02</span><div><h3>Authority checked</h3><p>We confirm the responsible contact, location, price, charges, and viewing process.</p></div></li>
              <li><span>03</span><div><h3>Availability refreshed</h3><p>The record carries a visible confirmation date and expires if nobody reconfirms it.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="homi-section homi-paths-section">
          <div className="homi-container homi-paths">
            <article id="roommates" className="homi-path homi-path--roommates">
              <div className="homi-path-icon"><UsersRound /></div>
              <p className="homi-kicker"><span /> Spend less together</p>
              <h2>A good home can be easier with the right person.</h2>
              <p>Find people whose budget, area, move-in date, and everyday habits fit yours—before you agree to share a home.</p>
              <ul><li><Check /> Private room or shared search</li><li><Check /> Budget and move-in alignment</li><li><Check /> Clear household expectations</li></ul>
              <Link href="/signup" className="homi-button homi-button--dark">Find a roommate <ArrowRight /></Link>
            </article>
            <article id="share" className="homi-path homi-path--share">
              <div className="homi-path-icon"><KeyRound /></div>
              <p className="homi-kicker"><span /> Know of an opening?</p>
              <h2>Help the next person hear about it first.</h2>
              <p>Share an upcoming vacancy from your compound or neighbourhood. We verify the details before it reaches renters.</p>
              <div className="homi-share-note"><strong>Rewards follow real outcomes.</strong><span>No payment for duplicated, unverifiable, or invented listings.</span></div>
              <Link href="/signup" className="homi-button homi-button--light">Share a vacancy <ArrowRight /></Link>
            </article>
          </div>
        </section>

        <section className="homi-section homi-safety">
          <div className="homi-container homi-safety-grid">
            <div><p className="homi-kicker"><span /> Safer by design</p><h2>Your search should not put your savings at risk.</h2></div>
            <div className="homi-safety-points">
              <div><ShieldCheck /><h3>Know who you’re speaking with</h3><p>Contacts are labelled by role so an owner, outgoing tenant, and local source are never presented as the same thing.</p></div>
              <div><ReceiptText /><h3>See charges before a viewing</h3><p>Rent, caution, legal, service, and other disclosed costs sit together in one clear breakdown.</p></div>
              <div><Clock3 /><h3>Spot stale listings quickly</h3><p>Every vacancy shows its latest confirmation date. Records that cannot be refreshed are removed.</p></div>
            </div>
          </div>
        </section>

        <section className="homi-final-cta">
          <div className="homi-container homi-final-inner">
            <div><p className="homi-kicker homi-kicker--light"><span /> Start with what’s real</p><h2>A clearer way to find your next home.</h2></div>
            <div><p>Join the early Homi community and be first to see recently confirmed vacancies in your area.</p><Link href="/signup" className="homi-button homi-button--accent">Create your free account <ArrowRight /></Link></div>
          </div>
        </section>
      </main>

      <footer className="homi-footer">
        <div className="homi-container homi-footer-grid">
          <div><Brand /><p>Fresh housing information, clearer costs, safer introductions.</p></div>
          <div><strong>Explore</strong><a href="#homes">Homes</a><a href="#roommates">Roommates</a><a href="#share">Share a vacancy</a></div>
          <div><strong>Company</strong><a href="#how-it-works">How it works</a><Link href="/safety">Safety</Link><Link href="/contact">Contact</Link></div>
          <p className="homi-footer-note">Built for a better housing search in Nigeria. <span aria-label="Nigeria flag">🇳🇬</span></p>
        </div>
      </footer>
    </div>
  );
}
