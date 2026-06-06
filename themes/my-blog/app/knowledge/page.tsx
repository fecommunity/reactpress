import KnowledgeClient from '@/components/views/KnowledgeClient';
import { buildLocalizedListPageMetadata } from '@/lib/reactpress/siteMetadata';
import { fetchKnowledgeIndexPageProps, themeApi, withApiRetry } from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedListPageMetadata('knowledge', undefined, { path: '/knowledge' });
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
