import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { resourceArticles } from '@/components/resources/resource-articles';
import { helpGuides } from '@/lib/help-guides';
import { SEO_LAST_UPDATED } from '@/lib/seo';
import { comparisonPages } from '@/lib/comparison-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { route: '', priority: 1, changeFrequency: 'weekly' },
    { route: '/features', priority: 0.9, changeFrequency: 'monthly' },
    { route: '/how-it-works', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { route: '/about', priority: 0.65, changeFrequency: 'monthly' },
    { route: '/security', priority: 0.55, changeFrequency: 'yearly' },
    { route: '/financial-controller', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/cash-flow-management', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/financial-analysis', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/business-expense-analysis', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/ng', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/text-to-transaction', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/customer-debt-tracking', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/cash-account-tracking', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/financial-intelligence', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/ai-transparency', priority: 0.65, changeFrequency: 'monthly' },
    { route: '/product-tour', priority: 0.85, changeFrequency: 'monthly' },
    { route: '/billing-and-limits', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/data-and-account-management', priority: 0.55, changeFrequency: 'yearly' },
    { route: '/help', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact', priority: 0.55, changeFrequency: 'yearly' },
    { route: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/terms', priority: 0.4, changeFrequency: 'yearly' },
  ].concat(resourceArticles.map(({ slug }) => ({ route: `/resources/${slug}`, priority: 0.7, changeFrequency: 'monthly' as const }))).concat(helpGuides.map(({ slug }) => ({ route: `/help/${slug}`, priority: 0.65, changeFrequency: 'monthly' as const }))).concat([
    { route: '/solutions', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/resources', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/install', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/compare', priority: 0.75, changeFrequency: 'monthly' as const },
    ...comparisonPages.map(({ slug }) => ({ route: `/compare/dorah-vs-${slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
  ]).map(({ route, priority, changeFrequency }) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(SEO_LAST_UPDATED),
    changeFrequency: changeFrequency as 'weekly' | 'monthly' | 'yearly',
    priority,
  }));
}
