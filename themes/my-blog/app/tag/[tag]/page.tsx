import TagArchiveClient from './TagArchiveClient';
import { buildListPageMetadata } from '@/src/reactpress/siteMetadata';
import { generateTagStaticParams } from '@/src/reactpress/staticParams';
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
    return buildListPageMetadata(`标签：${label}`);
  } catch {
    return buildListPageMetadata(`标签：${tagValue}`);
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
