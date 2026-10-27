import type { Metadata } from 'next';
import DorahMarketplaceHomepage from '@/components/dorah-market/DorahMarketplaceHomepage';
import { publicPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  title: 'Small Business Financial Controller',
  description: 'Track business income, expenses, customer debts, supplier bills, and financial changes in one clear workspace with Dorah.',
  path: '/',
});

export default function HomePage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Dorah',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description: 'A small-business financial controller for recording transactions, tracking receivables and payables, and reviewing rule-based financial findings.',
    featureList: [
      'Business income and expense tracking',
      'Customer receivables and supplier payables',
      'Cash and account balances',
      'Financial performance reports',
      'Evidence-backed financial checks',
    ],
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
      { '@type': 'Offer', name: 'Control', price: '3.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
      { '@type': 'Offer', name: 'Intelligence', price: '7.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing` },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }} /><DorahMarketplaceHomepage /></>;
}
