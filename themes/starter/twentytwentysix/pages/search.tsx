'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  ArchiveEmptyState,
  fetchSearchArticles,
  themeApi,
} from '@fecommunity/reactpress-toolkit/theme';
import BlogArticleList from '../components/BlogArticleList';
import DoubleColumnLayout from '../components/DoubleColumnLayout';
import SystemNotice from '../components/SystemNotice';
import ThemeShell from '../components/ThemeShell';
import { useThemeT } from '../hooks/useThemeT';

type SearchArticle = {
  id: string;
  title: string;
  summary?: string;
  cover?: string;
  publishAt?: string;
  views?: number;
  likes?: number;
  category?: { label: string; value: string };
};

/** Client-side search — avoids slow first SSR on `/search`. */
export default function SearchPage() {
  const t = useThemeT();
  const router = useRouter();
  const query = typeof router.query.keyword === 'string' ? router.query.keyword.trim() : '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [articles, setArticles] = useState<SearchArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setArticles([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSearchArticles(themeApi, query)
      .then((data) => {
        if (cancelled) return;
        setArticles((data.articles ?? []) as SearchArticle[]);
      })
      .catch((error) => {
        console.error('[twentytwentysix] search failed', error);
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      void router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <ThemeShell
      head={
        <>
          <title>
            {query
              ? t('search.titleWithQuery', '搜索：{query}').replace('{query}', query)
              : t('search.title', '搜索')}
          </title>
          <meta name="description" content={t('search.description', '搜索文章')} />
        </>
      }
    >
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <>
            <h1 className="archives-page-title">{t('search.title', '搜索')}</h1>
            <form onSubmit={handleSubmit} className="nav-search-bar search-form">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder', '请输入关键字搜索')}
                aria-label={t('common.search', '搜索')}
              />
              <button type="submit">{t('common.search', '搜索')}</button>
            </form>

            {!query ? (
              <p className="empty-state">{t('empty.searchHint', '输入关键字开始搜索文章。')}</p>
            ) : loading ? (
              <p className="loading-state">{t('common.loading', '加载中…')}</p>
            ) : (
              <>
                <p className="archives-summary">
                  {t('archives.searchSummary', '共找到 {count} 篇与「{query}」相关的文章')
                    .replace('{count}', String(articles.length))
                    .replace('{query}', query)}
                </p>
                {articles.length > 0 ? (
                  <BlogArticleList
                    articles={articles}
                    empty={t('empty.searchResult', '未找到相关文章')}
                  />
                ) : (
                  <ArchiveEmptyState
                    message={t('empty.searchResultMessage', '未找到相关文章。')}
                    backLabel={t('common.backHome', '← 返回首页')}
                    renderBackLink={({ href, label }) => (
                      <Link href={href} className="back-home-link">
                        {label}
                      </Link>
                    )}
                  />
                )}
              </>
            )}
          </>
        }
      />
    </ThemeShell>
  );
}
