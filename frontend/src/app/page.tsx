import type { Metadata } from 'next';
import DorahMarketplaceHomepage from '@/components/dorah-market/DorahMarketplaceHomepage';

export const metadata: Metadata = {
  title: { absolute: 'Dorah — Pay for the seat, not the whole plan' },
  description:
    'Find eligible seats for the digital tools you use, share the cost, and keep every renewal in one clear place.',
  openGraph: {
    title: 'Dorah — Pay for the seat, not the whole plan',
    description: 'Affordable access to the digital tools you use, with clear terms and simple renewals.',
    type: 'website',
    locale: 'en_NG',
  },
};

export default function HomePage() {
  return <DorahMarketplaceHomepage />;
}
