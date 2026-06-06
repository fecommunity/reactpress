import ArchivesClient from '@/components/views/ArchivesClient';
import { buildListPageMetadata } from '@/lib/reactpress/siteMetadata';
import {
  fetchArchivesPageProps,
  themeApi,
  withApiRetry,
  type ArchiveTree,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('归档');
}

export default async function ArchivesPage() {
  let articles: ArchiveTree = {};

  try {
    const data = await withApiRetry(() => fetchArchivesPageProps(themeApi));
    articles = data.articles;
  } catch (error) {
    console.error('[my-blog] archives fetch failed', error);
  }

  return <ArchivesClient articles={articles} />;
}
