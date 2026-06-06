import CategoryClient from './CategoryClient';
import {
  fetchCategoryArchivePageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryArchivePage({ params }: PageProps) {
  const { category } = await params;
  const categoryValue = decodeURIComponent(category);

  try {
    const data = await withApiRetry(() =>
      fetchCategoryArchivePageProps(themeApi, categoryValue),
    );
    return (
      <CategoryClient
        initialArticles={data.articles}
        total={data.total}
        category={data.category}
      />
    );
  } catch (error) {
    console.error('[my-blog] category archive fetch failed', error);
    notFound();
  }
}
