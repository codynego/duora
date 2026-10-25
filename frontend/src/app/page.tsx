import type { Metadata } from 'next';
import HomiHomepage from '@/components/homi/HomiHomepage';

export const metadata: Metadata = {
  title: { absolute: 'Homi.ng — Find homes that are still available' },
  description:
    'Discover recently confirmed rentals, see the full move-in cost, and connect directly with the person responsible for the home.',
  openGraph: {
    title: 'Homi.ng — Find homes that are still available',
    description: 'Recently confirmed rentals, transparent move-in costs, and safer direct introductions.',
    type: 'website',
    locale: 'en_NG',
  },
};

export default function HomePage() {
  return <HomiHomepage />;
}
