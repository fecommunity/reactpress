import CategoryClient from './CategoryClient';
import { buildListPageMetadata } from '@/src/reactpress/siteMetadata';
import { generateCategoryStaticParams } from '@/src/reactpress/staticParams';
import {
  fetchCategoryArchivePageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateStaticParams() {
  return generateCategoryStaticParams();
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryValue = decodeURIComponent(category);

  try {
    const data = await withApiRetry(() =>
      fetchCategoryArchivePageProps(themeApi, categoryValue),
    );
    const label = data.category?.label || categoryValue;
    return buildListPageMetadata(`分类：${label}`);
  } catch {
    return buildListPageMetadata(`分类：${categoryValue}`);
  }
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
