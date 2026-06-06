import KnowledgeBookClient from './KnowledgeBookClient';
import {
  fetchKnowledgeBookPageProps,
  themeApi,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ pId: string }>;
}

export default async function KnowledgeBookPage({ params }: PageProps) {
  const { pId } = await params;

  try {
    const data = await withApiRetry(() => fetchKnowledgeBookPageProps(themeApi, pId));
    if (!data.book?.id) {
      notFound();
    }
    return <KnowledgeBookClient pId={pId} book={data.book} otherBooks={data.otherBooks} />;
  } catch (error) {
    console.error('[my-blog] knowledge book page fetch failed', error);
    notFound();
  }
}
