import ArticleViewClient from '@/components/article/ArticleViewClient';
import {
  buildArticleJsonLd,
  buildArticleMetadata,
  parseSiteSeoContext,
} from '@/lib/reactpress/contentSeo';
import { generateArticleStaticParams } from '@/lib/reactpress/staticParams';
import {
  fetchArticleDetailProps,
  fetchSiteMeta,
  resolveImageUrl,
  themeApi,
  unwrapSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateStaticParams() {
  return generateArticleStaticParams();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function resolveAbsoluteImageUrl(cover: string | undefined, siteUrl?: string) {
  if (!cover) return undefined;
  const imageUrl = resolveImageUrl(cover, 'large');
  if (!siteUrl) return imageUrl;
  try {
    return new URL(imageUrl, siteUrl).href;
  } catch {
    return imageUrl;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const [{ article }, siteMeta, settingRow] = await Promise.all([
      withApiRetry(() => fetchArticleDetailProps(themeApi, id)),
      withApiRetry(() => fetchSiteMeta(themeApi)),
      withApiRetry(() => themeApi.setting.findAll()).then(unwrapSetting),
    ]);

    if (!article?.id || article.status !== 'publish') {
      return {};
    }

    const site = parseSiteSeoContext(settingRow, siteMeta);
    const imageUrl = resolveAbsoluteImageUrl(article.cover, site.siteUrl);
    return buildArticleMetadata(article, site, imageUrl);
  } catch (error) {
    console.error('[my-blog] article metadata fetch failed', error);
    return {};
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const [{ article }, siteMeta] = await Promise.all([
      withApiRetry(() => fetchArticleDetailProps(themeApi, id)),
      withApiRetry(() => fetchSiteMeta(themeApi)),
    ]);

    if (!article?.id || article.status !== 'publish') {
      notFound();
    }

    const coverUrl = resolveAbsoluteImageUrl(article.cover, siteMeta.siteUrl);
    const jsonLd = buildArticleJsonLd(article, siteMeta.siteUrl, coverUrl);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ArticleViewClient article={article} />
      </>
    );
  } catch (error) {
    console.error('[my-blog] article page fetch failed', error);
    notFound();
  }
}
