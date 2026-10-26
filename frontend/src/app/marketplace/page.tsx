import type { Metadata } from 'next';
import MarketplaceCatalog from '@/components/subscriptions/MarketplaceCatalog';

export const metadata: Metadata = {
  title: 'Marketplace — affordable digital subscription access',
  description: 'Browse reviewed subscription offers, see available seats and access methods, and find a more affordable way to use digital tools.',
  alternates: { canonical: '/marketplace' },
  openGraph: { title: 'Dorah Marketplace — affordable digital access', description: 'Browse reviewed subscription offers and open seats.' },
};

export default function MarketplacePage() { return <main className="min-h-screen bg-[#F5F7FB]"><MarketplaceCatalog /></main>; }
