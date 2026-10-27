import type { Metadata } from 'next';
import DorahMarketplaceHomepage from '@/components/dorah-market/DorahMarketplaceHomepage';

export const metadata: Metadata = {
  title: { absolute: 'Dorah — Know where your business money stands' },
  description:
    'Your AI-powered financial controller helps you track money in and out, manage customer debts, spot discrepancies, and understand what needs attention.',
  openGraph: {
    title: 'Dorah — Know where your business money stands',
    description: 'Track business money, customer debts, bills, and financial discrepancies in one place.',
    type: 'website',
    locale: 'en_NG',
  },
};

export default function HomePage() {
  return <DorahMarketplaceHomepage />;
}
