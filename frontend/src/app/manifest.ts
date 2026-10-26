import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dorah',
    short_name: 'Dorah',
    description: 'Affordable digital access and subscription management in one place.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F5F7FB',
    theme_color: '#3157F5',
    categories: ['finance', 'shopping', 'utilities'],
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Browse subscriptions', short_name: 'Marketplace', description: 'Find an eligible open subscription seat.', url: '/#subscriptions', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
      { name: 'My subscriptions', short_name: 'Subscriptions', description: 'Review subscriptions and upcoming renewals.', url: '/home', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
    ],
  };
}
