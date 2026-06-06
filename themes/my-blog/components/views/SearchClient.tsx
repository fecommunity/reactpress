'use client';

import ArticleList from '@/components/article/ArticleList';
import ArticleRecommend from '@/components/article/ArticleRecommend';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import { useFeedFooterPlacement } from '@/lib/reactpress/useFeedFooterPlacement';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import type { ListArticle } from '@fecommunity/reactpress-toolkit/theme';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchClientProps {
  keyword: string;
  articles: ListArticle[];
}

export default function SearchClient({
  keyword: initialKeyword = '',
  articles: initialArticles = [],
}: SearchClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [articles, setArticles] = useState(initialArticles);
  const hasSearchResults = Boolean(initialKeyword.trim());
  const { footerInSidebar, footerAtBottom } = useFeedFooterPlacement({
    itemCount: hasSearchResults ? articles.length : 0,
  });

  useEffect(() => {
    setKeyword(initialKeyword);
    setArticles(initialArticles);
  }, [initialArticles, initialKeyword]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      fillMinHeight={footerAtBottom}
      leftNode={
        <>
          <search className="mb-4 block min-w-0 rounded-lg bg-[var(--bg-box)] p-5 shadow-[var(--box-shadow)] md:p-6">
            <h1 className="m-0 text-xl font-semibold text-[var(--main-text-color)]">{t('searchArticle')}</h1>
            <div className="rp-search-bar mt-3 flex min-w-0 gap-0">
              <input
                ref={inputRef}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch(keyword);
                }}
                placeholder={t('searchArticlePlaceholder')}
                className="rp-theme-input min-w-0 flex-1 rounded-l-lg border border-[var(--border-color)] bg-[var(--bg-body)] px-4 py-3 text-[15px] text-[var(--main-text-color)]"
              />
              <button
                type="button"
                onClick={() => runSearch(keyword)}
                className="rp-primary-button rounded-r-lg px-5 py-3 text-[15px] font-medium"
              >
                {t('search')}
              </button>
            </div>
          </search>
          {initialKeyword ? (
            <p className="mb-4 text-sm text-[var(--second-text-color)]">
              {t('totalSearch')}{' '}
              <span className="font-semibold text-[var(--primary-color)]">{articles.length}</span> {t('piece')}
              {' · '}
              <span className="font-medium text-[var(--main-text-color)]">&ldquo;{initialKeyword}&rdquo;</span>
            </p>
          ) : null}
          <main className="mb-16">
            {initialKeyword ? (
              articles.length ? (
                <ArticleList articles={articles} />
              ) : (
                <div className="rounded-lg bg-[var(--bg-box)] p-8 text-center text-[var(--second-text-color)]">
                  {t('empty')}
                </div>
              )
            ) : (
              <section className="rp-article-recommend">
                <p className="rp-cms-section-title">{t('recommendToReading')}</p>
                <div className="overflow-hidden rounded-xl shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5 [&_.rp-article-list]:shadow-none">
                  <ArticleRecommend needTitle={false} mode="vertical" />
                </div>
              </section>
            )}
          </main>
        </>
      }
      rightNode={
        <HomeSidebar
          showTags
          showCategories
          showRecommend={false}
          showAboutUs={footerInSidebar}
          deferRecommend
        />
      }
    />
  );
}
