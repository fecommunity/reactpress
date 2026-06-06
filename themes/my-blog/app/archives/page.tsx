import ArchivesClient from './ArchivesClient';
import {
  fetchArchivesPageProps,
  themeApi,
  withApiRetry,
  type ArchiveTree,
} from '@fecommunity/reactpress-toolkit/theme/server';

export const revalidate = 60;

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
