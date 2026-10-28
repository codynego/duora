import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dorah.me').replace(/\/$/, '');
export const SEO_LAST_UPDATED = '2026-10-28';

const CORE_KEYWORDS = [
  'Dorah',
  'small business finance software',
  'financial controller for small business',
  'cash flow tracking',
  'customer debt tracking',
  'supplier bill tracking',
];

export function publicPageMetadata({ title, description, path, keywords = [], type = 'website' }: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${canonical}`;
  return {
    title,
    description,
    keywords: [...new Set([...keywords, ...CORE_KEYWORDS])],
    authors: [{ name: 'Dorah', url: SITE_URL }],
    creator: 'Dorah',
    publisher: 'Dorah',
    category: 'finance',
    referrer: 'origin-when-cross-origin',
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    alternates: { canonical: canonicalUrl, languages: { 'en-NG': canonicalUrl, 'x-default': canonicalUrl } },
    openGraph: {
      type,
      url: canonicalUrl,
      siteName: 'Dorah',
      locale: 'en_NG',
      title: `${title} · Dorah`,
      description,
      images: [{ url: `${SITE_URL}/dorah-social-preview.png`, width: 1200, height: 630, alt: `${title} — Dorah financial controller` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · Dorah`,
      description,
      images: [`${SITE_URL}/dorah-social-preview.png`],
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${items.at(-1)?.path ?? '/'}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
