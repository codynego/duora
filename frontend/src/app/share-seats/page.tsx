import SharedSeatsDesk from '@/components/subscriptions/SharedSeatsDesk';
import MarketplaceShell from '@/components/subscriptions/MarketplaceShell';

export const metadata = {
  title: 'Share seats — Dorah',
  robots: { index: false, follow: false },
};

export default function ShareSeatsPage() { return <MarketplaceShell><SharedSeatsDesk /></MarketplaceShell>; }
