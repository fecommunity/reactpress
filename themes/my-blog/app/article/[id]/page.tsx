import ArticlePostLayout from '@/layouts/ArticlePostLayout';
import {
  fetchArticleDetailProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { article } = await withApiRetry(() => fetchArticleDetailProps(themeApi, id));
    if (!article?.id || article.status !== 'publish') {
      notFound();
    }
    return <ArticlePostLayout article={article} />;
  } catch (error) {
    console.error('[my-blog] article page fetch failed', error);
    notFound();
  }
}
