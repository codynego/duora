import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ['', '/marketplace', '/how-it-works', '/safety', '/community-guidelines', '/help', '/privacy', '/terms', '/contact', '/install'];
  return publicRoutes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: 'weekly' as const,
    priority: index === 0 ? 1 : 0.7,
  }));
}
