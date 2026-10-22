import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Duora',
    short_name: 'Duora',
    description: 'Shared experiences that turn chemistry into conversation.',
    id: '/',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fffdfc',
    theme_color: '#281D32',
    categories: ['social', 'lifestyle', 'games'],
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Explore thoughts', short_name: 'Explore', description: 'Find anonymous thoughts and conversations.', url: '/explore', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
      { name: 'Create an experience', short_name: 'Create', description: 'Start a private or public room.', url: '/experiences', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
    ],
  };
}
