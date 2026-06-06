import { getPageTitle } from '@fecommunity/reactpress-toolkit/theme/server';
import type { IArticle, IKnowledge, IPage } from '@fecommunity/reactpress-toolkit/types';
import type { Metadata } from 'next';

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

export function buildArticleMetadata(
  article: IArticle,
  site: SiteSeoContext,
): Metadata {
  const siteTitle = site.siteName ?? 'Blog';
  const description = article.summary || site.seoDesc || site.siteDescription;
  const keywords = buildKeywords(article.title, article.tags, site.seoKeyword);

  return {
    title: getPageTitle(article.title, { systemTitle: siteTitle }),
    description,
    keywords,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.publishAt,
      modifiedTime: article.updateAt,
      tags: (article.tags ?? []).map(tagLabel).filter(Boolean),
    },
  };
}

export function buildKnowledgeChapterMetadata(
  chapter: IKnowledge,
  book: IKnowledge,
  site: SiteSeoContext,
): Metadata {
  const siteTitle = site.siteName ?? 'Blog';
  const description = chapter.summary || book.summary || site.seoDesc || site.siteDescription;

  return {
    title: getPageTitle(`${chapter.title} - ${book.title}`, { systemTitle: siteTitle }),
    description,
    openGraph: {
      title: chapter.title,
      description,
      type: 'article',
      publishedTime: chapter.publishAt,
      modifiedTime: chapter.updateAt,
    },
  };
}

export function buildCmsPageMetadata(page: IPage, site: SiteSeoContext): Metadata {
  const siteTitle = site.siteName ?? 'Blog';
  const description = site.seoDesc || site.siteDescription;

  return {
    title: getPageTitle(page.name, { systemTitle: siteTitle }),
    description,
    openGraph: {
      title: page.name,
      description,
      type: 'website',
    },
  };
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
