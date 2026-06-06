import KnowledgeChapterClient from './KnowledgeChapterClient';
import {
  buildKnowledgeChapterMetadata,
  parseSiteSeoContext,
} from '@/src/reactpress/contentSeo';
import {
  fetchKnowledgeChapterPageProps,
  fetchSiteMeta,
  themeApi,
  unwrapSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ pId: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pId, id } = await params;

  try {
    const [data, siteMeta, settingRow] = await Promise.all([
      withApiRetry(() => fetchKnowledgeChapterPageProps(themeApi, pId, id)),
      withApiRetry(() => fetchSiteMeta(themeApi)),
      withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
    ]);

    if (!data.book?.id || !data.chapter?.id) {
      return {};
    }

    const site = parseSiteSeoContext(settingRow, siteMeta);
    return buildKnowledgeChapterMetadata(data.chapter, data.book, site);
  } catch (error) {
    console.error('[my-blog] knowledge chapter metadata fetch failed', error);
    return {};
  }
}

export default async function KnowledgeChapterPage({ params }: PageProps) {
  const { pId, id } = await params;

  try {
    const data = await withApiRetry(() => fetchKnowledgeChapterPageProps(themeApi, pId, id));
    if (!data.book?.id || !data.chapter?.id) {
      notFound();
    }
    return (
      <KnowledgeChapterClient
        pId={pId}
        id={id}
        book={data.book}
        chapter={data.chapter}
      />
    );
  } catch (error) {
    console.error('[my-blog] knowledge chapter page fetch failed', error);
    notFound();
  }
}
