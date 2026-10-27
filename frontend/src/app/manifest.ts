import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dorah',
    short_name: 'Dorah',
    description: 'An AI-powered financial controller for clearer small-business decisions.',
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F5F7FB',
    theme_color: '#3157F5',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
    shortcuts: [
      { name: 'Business overview', short_name: 'Overview', description: 'Review your business financial picture.', url: '/dashboard', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
      { name: 'Financial intelligence', short_name: 'Intelligence', description: 'Review financial findings and what needs attention.', url: '/dashboard/intelligence', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
    ],
  };
}
