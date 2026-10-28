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
    keywords: ['Dorah', 'small business finance', 'financial controller', 'business cash flow', 'customer debts', 'supplier bills'],
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'Dorah',
      locale: 'en_NG',
      title: `${title} · Dorah`,
      description,
      images: [{ url: '/dorah-social-preview.png', width: 1200, height: 630, alt: `${title} — Dorah financial controller` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · Dorah`,
      description,
      images: ['/dorah-social-preview.png'],
    },
  };
}
