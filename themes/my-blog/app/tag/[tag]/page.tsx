import TagArchiveClient from '@/components/views/TagArchiveClient';
import { buildListPageMetadata, buildLocalizedListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { generateTagStaticParams } from '@/lib/reactpress/staticParams';
import {
  fetchTagArchivePageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateStaticParams() {
  return generateTagStaticParams();
}

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagValue = decodeURIComponent(tag);

  try {
    const data = await withApiRetry(() => fetchTagArchivePageProps(themeApi, tagValue));
    const label = data.tag?.label || tagValue;
    return buildLocalizedListPageMetadata('pageTitleTag', { label }, {
      path: `/tag/${encodeURIComponent(tagValue)}`,
    });
  } catch {
    return buildLocalizedListPageMetadata('pageTitleTag', { label: tagValue }, {
      path: `/tag/${encodeURIComponent(tagValue)}`,
    });
  }
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag } = await params;
  const tagValue = decodeURIComponent(tag);

  try {
    const data = await withApiRetry(() => fetchTagArchivePageProps(themeApi, tagValue));
    return (
      <TagArchiveClient initialArticles={data.articles} total={data.total} tag={data.tag} />
    );
  } catch (error) {
    console.error('[my-blog] tag archive fetch failed', error);
    notFound();
  }
}
