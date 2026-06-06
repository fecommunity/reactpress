import type { IArticle, IKnowledge, IPage } from '@fecommunity/reactpress-toolkit/types';
import type { Metadata } from 'next';

import { buildPageMetadata, DEFAULT_OG_IMAGE } from './seoMetadata';

export type SiteSeoContext = {
  siteName?: string;
  siteDescription?: string;
  siteUrl?: string;
  seoKeyword?: string;
  seoDesc?: string;
};

export function parseSiteSeoContext(
  row: Record<string, unknown> | null,
  siteMeta?: { siteName?: string; siteDescription?: string; siteUrl?: string },
): SiteSeoContext {
  return {
    siteName: siteMeta?.siteName,
    siteDescription: siteMeta?.siteDescription,
    siteUrl: siteMeta?.siteUrl,
    seoKeyword: row?.seoKeyword != null ? String(row.seoKeyword) : undefined,
    seoDesc: row?.seoDesc != null ? String(row.seoDesc) : undefined,
  };
}

function tagLabel(tag: string | { label?: string }) {
  return typeof tag === 'string' ? tag : tag?.label ?? '';
}

function buildKeywords(
  title: string,
  tags: Array<string | { label?: string }> | undefined,
  siteKeywords?: string,
) {
  return [title]
    .concat((tags ?? []).map(tagLabel))
    .concat(siteKeywords?.split(',') ?? [])
    .filter(Boolean)
    .join(',');
}

function resolveCmsPagePath(page: IPage): string {
  const customPath = page.path?.trim();
  if (customPath) {
    return customPath.startsWith('/') ? customPath : `/${customPath}`;
  }
  return `/page/${page.id}`;
}

export function buildArticleMetadata(
  article: IArticle,
  site: SiteSeoContext,
  imageUrl?: string,
): Metadata {
  const siteName = site.siteName ?? 'Blog';
  const description = article.summary || site.seoDesc || site.siteDescription;
  const keywords = buildKeywords(article.title, article.tags, site.seoKeyword);
  const images = imageUrl ? [imageUrl] : [DEFAULT_OG_IMAGE];

  return buildPageMetadata({
    title: article.title,
    description,
    keywords,
    path: `/article/${article.id}`,
    siteUrl: site.siteUrl,
    siteName,
    ogType: 'article',
    images,
    publishedTime: article.publishAt,
    modifiedTime: article.updateAt,
    tags: (article.tags ?? []).map(tagLabel).filter(Boolean),
  });
}

export function buildKnowledgeChapterMetadata(
  chapter: IKnowledge,
  book: IKnowledge,
  site: SiteSeoContext,
): Metadata {
  const description = chapter.summary || book.summary || site.seoDesc || site.siteDescription;

  return buildPageMetadata({
    title: `${chapter.title} - ${book.title}`,
    description,
    path: `/knowledge/${book.id}/${chapter.id}`,
    siteUrl: site.siteUrl,
    siteName: site.siteName ?? 'Blog',
    ogType: 'article',
    images: [DEFAULT_OG_IMAGE],
    publishedTime: chapter.publishAt,
    modifiedTime: chapter.updateAt,
  });
}

export function buildCmsPageMetadata(page: IPage, site: SiteSeoContext): Metadata {
  const description = site.seoDesc || site.siteDescription;

  return buildPageMetadata({
    title: page.name,
    description,
    path: resolveCmsPagePath(page),
    siteUrl: site.siteUrl,
    siteName: site.siteName ?? 'Blog',
    images: [DEFAULT_OG_IMAGE],
  });
}

export function buildArticleJsonLd(
  article: IArticle,
  siteUrl?: string,
  coverUrl?: string,
) {
  const url = siteUrl ? new URL(`/article/${article.id}`, siteUrl).href : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    datePublished: article.publishAt,
    dateModified: article.updateAt ?? article.publishAt,
    ...(url ? { url, mainEntityOfPage: url } : {}),
    ...(coverUrl ? { image: [coverUrl] } : {}),
    keywords: (article.tags ?? []).map(tagLabel).filter(Boolean).join(', '),
  };
}
