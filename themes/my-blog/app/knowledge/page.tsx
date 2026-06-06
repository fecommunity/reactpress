import KnowledgeClient from './KnowledgeClient';
import { buildListPageMetadata } from '@/src/reactpress/siteMetadata';
import { fetchKnowledgeIndexPageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildListPageMetadata('知识库');
}

export default async function KnowledgePage() {
  let books = [];
  let total = 0;

  try {
    const data = await withApiRetry(() => fetchKnowledgeIndexPageProps(themeApi, 12));
    books = data.books;
    total = data.total;
  } catch (error) {
    console.error('[my-blog] knowledge page fetch failed', error);
  }

  return <KnowledgeClient initialBooks={books} total={total} />;
}
