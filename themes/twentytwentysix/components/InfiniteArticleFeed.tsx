'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArticleRowItem } from './BlogArticleList';
import BlogArticleList from './BlogArticleList';
import { useThemeT } from '../hooks/useThemeT';
import {
  fetchCategoryArticles,
  fetchPublishedArticles,
  fetchTagArticles,
  HOME_PAGE_SIZE,
  themeApi,
} from '../lib/fetch';

export type ArticleFeedSource =
  | { type: 'home' }
  | { type: 'category'; category: string }
  | { type: 'tag'; tag: string };

interface InfiniteArticleFeedProps {
  source: ArticleFeedSource;
  initialArticles: ArticleRowItem[];
  total: number;
}

async function fetchPage(source: ArticleFeedSource, page: number) {
  if (source.type === 'category') {
    return fetchCategoryArticles(themeApi, source.category, page, HOME_PAGE_SIZE);
  }
  if (source.type === 'tag') {
    return fetchTagArticles(themeApi, source.tag, page, HOME_PAGE_SIZE);
  }
  return fetchPublishedArticles(themeApi, page, HOME_PAGE_SIZE);
}

function sourceKey(source: ArticleFeedSource): string {
  if (source.type === 'category') return `category:${source.category}`;
  if (source.type === 'tag') return `tag:${source.tag}`;
  return 'home';
}

/** Paginated article list with infinite scroll — home / category / tag. */
export default function InfiniteArticleFeed({
  source,
  initialArticles,
  total,
}: InfiniteArticleFeedProps) {
  const t = useThemeT();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const key = sourceKey(source);

  useEffect(() => {
    setArticles(initialArticles);
    setPage(1);
  }, [initialArticles, key]);

  const hasMore = page * HOME_PAGE_SIZE < total;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const { items } = await fetchPage(source, nextPage);
      setPage(nextPage);
      setArticles((prev) => [...prev, ...(items as ArticleRowItem[])]);
    } catch (error) {
      console.error('[twentytwentysix] load more articles failed', error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, source]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <BlogArticleList articles={articles} />
      {hasMore ? (
        <div ref={sentinelRef} className="infinite-scroll-sentinel" aria-hidden />
      ) : null}
      {loading ? (
        <p className="loading-state loading-state--inline">
          {t('home.loadingMore', '正在获取文章...')}
        </p>
      ) : null}
    </>
  );
}
