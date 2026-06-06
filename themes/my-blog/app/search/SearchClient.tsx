'use client';

import ArticleList from '@/components/reactpress/ArticleList';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import HomeSidebar from '@/components/reactpress/HomeSidebar';
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
      leftNode={
        <>
          <header
            className="mb-4 min-w-0 rounded-lg bg-[var(--bg-box)] p-5 shadow-[var(--box-shadow)] md:p-6"
            role="search"
          >
            <h1 className="m-0 text-xl font-semibold text-[var(--main-text-color)]">{t('searchArticle')}</h1>
            <div className="mt-3 flex min-w-0 gap-0">
              <input
                ref={inputRef}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch(keyword);
                }}
                placeholder={t('searchArticlePlaceholder')}
                className="min-w-0 flex-1 rounded-l-lg border border-[var(--border-color)] bg-[var(--bg-body)] px-4 py-3 text-[15px] text-[var(--main-text-color)] outline-none focus:border-[var(--primary-color)]"
              />
              <button
                type="button"
                onClick={() => runSearch(keyword)}
                className="rounded-r-lg bg-[var(--primary-color)] px-5 py-3 text-[15px] font-medium text-white"
              >
                {t('search')}
              </button>
            </div>
          </header>
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
            ) : null}
          </main>
        </>
      }
      rightNode={<HomeSidebar showTags showCategories deferRecommend={false} />}
    />
  );
}
