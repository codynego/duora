import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Duora',
    short_name: 'Duora',
    description: 'Shared experiences that turn chemistry into conversation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffdfc',
    theme_color: '#281D32',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
