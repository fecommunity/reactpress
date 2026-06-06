import TagArchiveClient from './TagArchiveClient';
import {
  fetchTagArchivePageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ tag: string }>;
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
