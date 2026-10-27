import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { resourceArticles } from '@/components/resources/resource-articles';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { route: '', priority: 1, changeFrequency: 'weekly' },
    { route: '/features', priority: 0.9, changeFrequency: 'monthly' },
    { route: '/how-it-works', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { route: '/about', priority: 0.65, changeFrequency: 'monthly' },
    { route: '/security', priority: 0.55, changeFrequency: 'yearly' },
    { route: '/help', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact', priority: 0.55, changeFrequency: 'yearly' },
    { route: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/terms', priority: 0.4, changeFrequency: 'yearly' },
  ].concat(resourceArticles.map(({ slug }) => ({ route: `/resources/${slug}`, priority: 0.7, changeFrequency: 'monthly' as const }))).concat([
    { route: '/solutions', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/resources', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/install', priority: 0.5, changeFrequency: 'monthly' as const },
  ]).map(({ route, priority, changeFrequency }) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: changeFrequency as 'weekly' | 'monthly' | 'yearly',
    priority,
  }));
}
