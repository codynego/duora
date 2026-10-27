import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dorah.me').replace(/\/$/, '');

export function publicPageMetadata({ title, description, path }: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'Dorah',
      locale: 'en_NG',
      title: `${title} · Dorah`,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${title} — Dorah financial controller` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · Dorah`,
      description,
      images: ['/opengraph-image'],
    },
  };
}
