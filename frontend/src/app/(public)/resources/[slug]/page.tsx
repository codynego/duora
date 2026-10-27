import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ResourceArticlePage from '@/components/resources/ResourceArticlePage';
import { getResourceArticle, resourceArticles } from '@/components/resources/resource-articles';
import { publicPageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return resourceArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) return {};
  return publicPageMetadata({ title: article.title, description: article.description, path: `/resources/${article.slug}` });
}

export default async function ResourceArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) notFound();
  return <ResourceArticlePage article={article} />;
}
