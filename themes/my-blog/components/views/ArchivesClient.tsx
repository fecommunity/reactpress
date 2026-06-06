'use client';

import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import Link from '@/components/shared/Link';
import { FEED_PAGE_SIZE } from '@/lib/reactpress/feedFooterPlacement';
import { useFeedFooterPlacement } from '@/lib/reactpress/useFeedFooterPlacement';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  countArchiveArticles,
  formatArchiveDay,
  sortedArchiveYears,
  type ArchiveArticle,
  type ArchiveTree,
} from '@fecommunity/reactpress-toolkit/theme';
import { useMemo, useState } from 'react';

const INITIAL_OPEN_YEARS = 2;

interface ArchivesClientProps {
  articles: ArchiveTree;
}

function ArchiveMonthList({ month, articles }: { month: string; articles: ArchiveArticle[] }) {
  return (
    <div className="px-4 py-2">
      <h3 className="m-0 text-base text-[var(--second-text-color)]">{month}</h3>
      <ul className="m-0 list-none pl-10">
        {articles.map((article) => (
          <li key={article.id} className="relative py-2 hover:text-[var(--primary-color)]">
            <span
              className="absolute top-[17px] -left-4 h-1.5 w-1.5 rounded-full bg-[var(--disable-text-color,#999)]"
              aria-hidden
            />
            <Link
              href={`/article/${article.id}`}
              aria-label={article.title}
              className="inline-flex w-full gap-3 overflow-hidden text-ellipsis whitespace-nowrap no-underline hover:text-inherit"
            >
              <span className="shrink-0 text-sm text-[var(--second-text-color)]">
                {formatArchiveDay(article.publishAt)}
              </span>
              <span className="truncate font-semibold text-[var(--main-text-color)]">{article.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ArchivesClient({ articles }: ArchivesClientProps) {
  const { t } = useLocale();
  const years = useMemo(() => sortedArchiveYears(articles), [articles]);
  const total = useMemo(() => countArchiveArticles(articles), [articles]);
  const { footerInSidebar, footerAtBottom } = useFeedFooterPlacement({
    itemCount: total,
    pageSize: FEED_PAGE_SIZE,
  });
  const [openYears, setOpenYears] = useState<Set<string>>(
    () => new Set(years.slice(0, INITIAL_OPEN_YEARS)),
  );

  const toggleYear = (year: string) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  return (
    <DoubleColumnLayout
      fillMinHeight={footerAtBottom}
      leftNode={
        <div className="overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
          <div className="border-b border-[var(--border-color)] px-4 py-6 text-center">
            <p className="m-0 text-2xl font-medium text-[var(--primary-color)]">{t('archives')}</p>
            <p className="mt-2 mb-0 text-lg text-[var(--primary-color)]">
              {t('total')} <span>{total}</span> {t('piece')}
            </p>
          </div>
          {years.map((year) => {
            const isOpen = openYears.has(year);
            const monthKeys = Object.keys(articles[year]);
            return (
              <section key={year} className="px-5 py-4">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                  aria-expanded={isOpen}
                  onClick={() => toggleYear(year)}
                >
                  <h2 className="m-0 text-2xl text-[var(--main-text-color)]">{year}</h2>
                  <span className="text-xl text-[var(--second-text-color)]">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen
                  ? monthKeys.map((month) => (
                      <ArchiveMonthList
                        key={`${year}-${month}`}
                        month={month}
                        articles={articles[year][month]}
                      />
                    ))
                  : null}
              </section>
            );
          })}
          {openYears.size < years.length ? (
            <div className="px-5 pb-6 text-center">
              <button
                type="button"
                onClick={() => setOpenYears(new Set(years))}
                className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--main-text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
              >
                {t('all')} {t('archives')}
              </button>
            </div>
          ) : null}
        </div>
      }
      rightNode={
        <HomeSidebar showTags={false} showCategories showAboutUs={footerInSidebar} deferRecommend={false} />
      }
    />
  );
}
