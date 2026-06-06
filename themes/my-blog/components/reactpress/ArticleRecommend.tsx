'use client';

import ArticleList from '@/components/reactpress/ArticleList';
import Link from '@/components/Link';
import { ArticleProvider } from '@/src/providers';
import { EyeIcon } from '@/src/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { slimArticlesForList } from '@fecommunity/reactpress-toolkit/theme';
import { useEffect, useState } from 'react';

interface ArticleRecommendProps {
  articleId?: string | null;
  mode?: 'inline' | 'vertical';
  needTitle?: boolean;
  deferFetch?: boolean;
}

const SKELETON_ROWS = 5;

function RecommendSkeleton() {
  return (
    <ul className="m-0 list-none px-4 pb-4" aria-hidden>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <li key={i} className="flex items-center gap-2 pt-4">
          <span className="h-[18px] w-[18px] shrink-0 animate-pulse rounded bg-[var(--border-color)]" />
          <span className="h-3.5 max-w-[72%] flex-1 animate-pulse rounded bg-[var(--border-color)]" />
          <span className="h-3.5 w-10 shrink-0 animate-pulse rounded bg-[var(--border-color)]" />
        </li>
      ))}
    </ul>
  );
}

export default function ArticleRecommend({
  mode = 'vertical',
  articleId = null,
  needTitle = true,
  deferFetch = false,
}: ArticleRecommendProps) {
  const { t } = useLocale();
  const requestKey = articleId ?? '';
  const [fetchedKey, setFetchedKey] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<
    Array<{
      id: string;
      title: string;
      views: number;
      summary?: string;
      likes?: number;
      publishAt?: string;
      cover?: string;
      category?: { value: string; label: string };
    }>
  >([]);

  useEffect(() => {
    if (fetchedKey === requestKey) return;
    let cancelled = false;

    const run = () => {
      ArticleProvider.getRecommend(articleId).then((res) => {
        if (cancelled) return;
        const next = slimArticlesForList(res.slice(0, 6));
        next.sort((a, b) => b.views - a.views);
        setArticles(next);
        setFetchedKey(requestKey);
      });
    };

    if (deferFetch && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => run(), { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [articleId, deferFetch, fetchedKey, requestKey]);

  const ready = fetchedKey === requestKey;
  const showSkeleton = !ready && articles.length === 0;
  const showEmpty = ready && articles.length === 0;

  if (mode === 'vertical') {
    if (showSkeleton) return <RecommendSkeleton />;
    if (showEmpty) return <div className="text-sm text-[var(--second-text-color)]">{t('empty')}</div>;
    return <ArticleList articles={articles as Parameters<typeof ArticleList>[0]['articles']} />;
  }

  return (
    <div className="mb-5 overflow-hidden rounded-lg bg-[var(--bg-box)] leading-snug shadow-[var(--box-shadow)]">
      {needTitle ? (
        <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
          <span className="mr-2 text-[var(--primary-color)]">♥</span>
          <span>{t('recommendToReading')}</span>
        </div>
      ) : null}

      {showSkeleton ? (
        <RecommendSkeleton />
      ) : showEmpty ? (
        <div className="px-4 py-3 pb-4 text-sm text-[var(--second-text-color)]">{t('empty')}</div>
      ) : (
        <ul className="rp-recommend-inline m-0 list-none px-4 pb-4">
          {articles.map((article, index) => (
            <li key={article.id} className="pt-4">
              <Link
                href={`/article/${article.id}`}
                title={article.title}
                className="flex w-full items-center justify-between gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--second-text-color)] no-underline hover:text-[var(--primary-color)]"
              >
                <span className="rp-recommend-title flex min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap text-[var(--main-text-color)]">
                  <span className="truncate" data-num={index + 1}>
                    {article.title}
                  </span>
                </span>
                <span className="inline-flex w-[54px] shrink-0 items-center justify-end text-[var(--second-text-color)]">
                  <EyeIcon size={14} />
                  <span className="ml-1">{article.views}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
