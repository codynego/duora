import type { Metadata } from 'next';
import DorahMarketplaceHomepage from '@/components/dorah-market/DorahMarketplaceHomepage';
import { publicPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Small Business Financial Controller and Money Tracker',
  description: 'Track income, expenses, cash accounts, customer debts, and supplier bills. Ask questions of your records with Dorah’s small-business financial controller.',
  path: '/',
  keywords: ['small business financial controller', 'business money tracker Nigeria', 'AI financial assistant for small business'],
});

export default function HomePage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#application`,
    name: 'Dorah',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
    url: SITE_URL,
    description: 'A small-business financial controller for recording transactions, tracking receivables and payables, reviewing financial findings, and asking questions grounded in saved records.',
    audience: { '@type': 'BusinessAudience', audienceType: 'Small-business owners' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    featureList: [
      'Business income and expense tracking',
      'Customer receivables and supplier payables',
      'Cash and account balances',
      'Financial performance reports',
      'Evidence-backed financial checks',
      'Text-to-transaction drafts',
      'Financial Intelligence questions and analysis',
    ],
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
      { '@type': 'Offer', name: 'Control', price: '3.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
      { '@type': 'Offer', name: 'Intelligence', price: '7.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }} /><DorahMarketplaceHomepage /></>;
}
