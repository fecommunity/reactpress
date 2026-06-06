'use client';

import ArticleList from '@/components/article/ArticleList';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import SearchHero from '@/components/search/SearchHero';
import SearchQuickLinks from '@/components/search/SearchQuickLinks';
import { useFeedFooterPlacement } from '@/lib/reactpress/useFeedFooterPlacement';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import type { ListArticle } from '@fecommunity/reactpress-toolkit/theme';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface SearchClientProps {
  keyword: string;
  articles: ListArticle[];
  navConfig?: {
    urlConfig?: unknown[];
    searchCategories?: {
      categories?: Array<{ key: string; label: string }>;
      subCategories?: Record<string, Array<{ key: string; label: string; url?: string }>>;
    };
  };
}

export default function SearchClient({
  keyword: initialKeyword = '',
  articles: initialArticles = [],
  navConfig,
}: SearchClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { siteConfig } = useSiteCatalog();
  const [articles, setArticles] = useState(initialArticles);
  const hasSearchResults = Boolean(initialKeyword.trim());
  const { footerAtBottom } = useFeedFooterPlacement({
    itemCount: hasSearchResults ? articles.length : 0,
  });

  const searchCategories =
    navConfig?.searchCategories || siteConfig?.nav?.searchCategories;
  const urlConfig =
    (navConfig?.urlConfig || siteConfig?.nav?.urlConfig || []) as Parameters<
      typeof SearchQuickLinks
    >[0]['dataSource'];

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        router.push('/search');
        return;
      }
      router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  return (
    <DoubleColumnLayout
      className="rp-search-page"
      fillMinHeight={footerAtBottom}
      topNode={
        <SearchHero
          searchCategories={searchCategories}
          initialKeyword={initialKeyword}
          onLocalSearch={runSearch}
          compact={hasSearchResults}
        />
      }
      leftNode={
        hasSearchResults ? (
          <div className="rp-search-results">
            <div className="rp-search-results__summary">
              <p className="m-0 text-sm text-[var(--second-text-color)]">
                {t('totalSearch')}{' '}
                <span className="font-semibold text-[var(--primary-color)]">{articles.length}</span> {t('piece')}
              </p>
              <p className="m-0 mt-1 text-base font-medium text-[var(--main-text-color)]">
                &ldquo;{initialKeyword}&rdquo;
              </p>
            </div>
            <main className="rp-search-results__list">
              {articles.length ? (
                <ArticleList articles={articles} />
              ) : (
                <div className="rounded-xl bg-[var(--bg-box)] p-10 text-center text-[var(--second-text-color)] ring-1 ring-black/5 dark:ring-white/5">
                  {t('empty')}
                </div>
              )}
            </main>
          </div>
        ) : (
          <SearchQuickLinks dataSource={urlConfig} />
        )
      }
    />
  );
}
