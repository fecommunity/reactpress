'use client';

import ArticleList from '@/components/article/ArticleList';
import Link from '@/components/shared/Link';
import SectionHeading, { EmptyState } from '@/components/shared/SectionHeading';
import { ArticleProvider } from '@/lib/providers/client';
import { EyeIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { slimArticlesForList } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

interface ArticleRecommendProps {
  articleId?: string | null;
  mode?: 'inline' | 'vertical';
  needTitle?: boolean;
  deferFetch?: boolean;
  /** Render as article page section (heading + panel wrapper). */
  asPageSection?: boolean;
  /** Hide entire section when loaded with no articles. */
  hideWhenEmpty?: boolean;
}

type RecommendArticle = {
  id: string;
  title: string;
  views: number;
  summary?: string;
  likes?: number;
  publishAt?: string;
  cover?: string;
  category?: { value: string; label: string };
};

const SKELETON_ROWS = 5;
const INLINE_VISIBLE = 5;
const INLINE_FETCH_SIZE = 15;
const VERTICAL_FETCH_SIZE = 6;
const SCROLL_ROW_PX = 52;
const SCROLL_INTERVAL_MS = 3200;

function dedupeById(articles: RecommendArticle[]): RecommendArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

/** Recommend API may still cap at 6 on older backends — pad with hot articles from list API. */
async function loadRecommendArticles(
  articleId: string | null,
  fetchSize: number,
): Promise<RecommendArticle[]> {
  const recommended = slimArticlesForList(await ArticleProvider.getRecommend(articleId, fetchSize));
  let pool = dedupeById(recommended);
  pool.sort((a, b) => b.views - a.views);

  if (pool.length >= fetchSize || articleId) {
    return pool.slice(0, fetchSize);
  }

  const [listRows] = await ArticleProvider.getArticles({
    page: 1,
    pageSize: Math.max(fetchSize * 2, 24),
    status: 'publish',
  });

  pool = dedupeById([...pool, ...slimArticlesForList(listRows)]);
  pool.sort((a, b) => b.views - a.views);
  return pool.slice(0, fetchSize);
}

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

function RecommendScrollRow({
  article,
  rank,
  compact = false,
}: {
  article: RecommendArticle;
  rank: number;
  compact?: boolean;
}) {
  return (
    <li className={compact ? 'rp-recommend-scroll-row flex items-center' : 'pt-4'}>
      <Link
        href={`/article/${article.id}`}
        title={article.title}
        className="flex w-full items-center justify-between gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--second-text-color)] no-underline hover:text-[var(--primary-color)]"
      >
        <span className="rp-recommend-title flex min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap text-[var(--main-text-color)]">
          <span className="truncate" data-num={rank}>
            {article.title}
          </span>
        </span>
        <span className="inline-flex w-[54px] shrink-0 items-center justify-end text-[var(--second-text-color)]">
          <EyeIcon size={14} />
          <span className="ml-1">{article.views}</span>
        </span>
      </Link>
    </li>
  );
}

function RecommendInlineScroller({ articles }: { articles: RecommendArticle[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [instant, setInstant] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const canScroll = articles.length > INLINE_VISIBLE && !reduceMotion;
  const loopItems = useMemo(
    () => (canScroll ? [...articles, ...articles] : articles),
    [articles, canScroll],
  );

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setInstant(false);
  }, [articles]);

  useEffect(() => {
    clearResetTimer();
    if (!canScroll || paused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, SCROLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [canScroll, paused, articles, clearResetTimer]);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const handleTransitionEnd = () => {
    if (!canScroll || activeIndex < articles.length) return;

    clearResetTimer();
    setInstant(true);
    setActiveIndex(0);
    resetTimerRef.current = window.setTimeout(() => {
      setInstant(false);
      resetTimerRef.current = null;
    }, 20);
  };

  if (!canScroll) {
    return (
      <ul className="rp-recommend-inline rp-recommend-fade-in m-0 list-none px-4 pb-4">
        {articles.map((article, index) => (
          <RecommendScrollRow key={article.id} article={article} rank={index + 1} />
        ))}
      </ul>
    );
  }

  return (
    <div
      className="rp-recommend-scroll rp-recommend-fade-in px-4 pb-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="rp-recommend-scroll-viewport" aria-live="off">
        <ul
          className={`rp-recommend-inline rp-recommend-scroll-track m-0 list-none ${instant ? 'is-instant' : ''}`}
          style={{ transform: `translateY(-${activeIndex * SCROLL_ROW_PX}px)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopItems.map((article, index) => (
            <RecommendScrollRow
              key={`${article.id}-${index}`}
              article={article}
              rank={(index % articles.length) + 1}
              compact
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ArticleRecommend({
  mode = 'vertical',
  articleId = null,
  needTitle = true,
  deferFetch = false,
  asPageSection = false,
  hideWhenEmpty = false,
}: ArticleRecommendProps) {
  const { t } = useLocale();
  const requestKey = `${articleId ?? ''}:${mode}`;
  const [fetchedKey, setFetchedKey] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<RecommendArticle[]>([]);

  useEffect(() => {
    if (fetchedKey === requestKey) return;
    let cancelled = false;

    const fetchSize = mode === 'inline' ? INLINE_FETCH_SIZE : VERTICAL_FETCH_SIZE;

    const run = () => {
      loadRecommendArticles(articleId, fetchSize)
        .then((next) => {
          if (cancelled) return;
          setArticles(next);
          setFetchedKey(requestKey);
        })
        .catch(() => {
          if (cancelled) return;
          setArticles([]);
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
  }, [articleId, deferFetch, fetchedKey, requestKey, mode]);

  const ready = fetchedKey === requestKey;
  const showSkeleton = !ready && articles.length === 0;
  const showEmpty = ready && articles.length === 0;

  if (mode === 'vertical') {
    if (hideWhenEmpty && showEmpty) return null;

    let body: ReactNode;
    if (showSkeleton) {
      body = <RecommendSkeleton />;
    } else if (showEmpty) {
      body = <EmptyState />;
    } else {
      body = <ArticleList articles={articles as Parameters<typeof ArticleList>[0]['articles']} />;
    }

    if (asPageSection) {
      return (
        <section className="rp-article-recommend">
          <SectionHeading>{t('recommendToReading')}</SectionHeading>
          <div className="rp-article-recommend-panel">{body}</div>
        </section>
      );
    }

    return body;
  }

  return (
    <div className="rp-widget-panel mb-5 overflow-hidden rounded-xl bg-[var(--bg-box)] leading-snug shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5">
      {needTitle ? (
        <div className="border-b border-[var(--border-color)] p-4 font-bold text-[var(--main-text-color)]">
          <span className="mr-2 text-[var(--primary-color)]">♥</span>
          <span>{t('recommendToReading')}</span>
        </div>
      ) : null}

      {showSkeleton ? (
        <RecommendSkeleton />
      ) : showEmpty ? (
        <EmptyState />
      ) : (
        <RecommendInlineScroller articles={articles} />
      )}
    </div>
  );
}
