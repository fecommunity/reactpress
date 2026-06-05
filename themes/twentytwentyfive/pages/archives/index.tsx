import dynamic from 'next/dynamic';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import {
  countArchiveArticles,
  fetchArchivesPageProps,
  formatArchiveDay,
  sortedArchiveYears,
  themeApi,
  themeStaticProps,
  useSiteCatalog,
  useSiteSetting,
  withApiRetry,
  type ArchiveArticle,
  type ArchiveTree,
} from '@fecommunity/reactpress-toolkit/theme';

import indexStyle from '../index.module.scss';
import style from './index.module.scss';

const ArchiveSidebar = dynamic(() =>
  import('@/components/ArchiveSidebar').then((m) => m.ArchiveSidebar),
);

const INITIAL_OPEN_YEARS = 2;

function ArchiveMonthList({ month, articles }: { month: string; articles: ArchiveArticle[] }) {
  return (
    <div className={style.item}>
      <h3>{month}</h3>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/article/${article.id}`} scroll={false} prefetch={false}>
              <a aria-label={article.title}>
                <span className={style.meta}>{formatArchiveDay(article.publishAt)}</span>
                <span className={style.title}>{article.title}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface IProps {
  articles: ArchiveTree;
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const data = await withApiRetry(() => fetchArchivesPageProps(themeApi));
    return themeStaticProps({ ...data, needLayoutFooter: false });
  } catch (error) {
    console.error('[reactpress] fetch archives page', error);
    return themeStaticProps({ articles: {}, needLayoutFooter: false });
  }
};

const Archives: NextPage<IProps> = ({ articles }) => {
  const setting = useSiteSetting();
  const { categories } = useSiteCatalog();
  const t = useTranslations();
  const years = useMemo(() => sortedArchiveYears(articles), [articles]);
  const total = useMemo(() => countArchiveArticles(articles), [articles]);
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

  const expandAllYears = () => setOpenYears(new Set(years));

  return (
    <DoubleColumnLayout
      leftNode={
        <div className={style.content}>
          <Head>
            <title>{`${t('archives')} - ${setting.systemTitle}`}</title>
          </Head>
          <div className={style.summary}>
            <p>
              <span>{t('archives')}</span>
            </p>
            <p>
              {t('total')} <span>{total}</span> {t('piece')}
            </p>
          </div>
          {years.map((year) => {
            const isOpen = openYears.has(year);
            const monthKeys = Object.keys(articles[year]);
            return (
              <section className={style.list} key={year}>
                <button
                  type="button"
                  className={style.yearToggle}
                  aria-expanded={isOpen}
                  onClick={() => toggleYear(year)}
                >
                  <h2>{year}</h2>
                  <span className={style.yearHint}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen
                  ? monthKeys.map((month) => (
                      <ArchiveMonthList key={`${year}-${month}`} month={month} articles={articles[year][month]} />
                    ))
                  : null}
              </section>
            );
          })}
          {openYears.size < years.length ? (
            <div className={style.expandAll}>
              <button type="button" className={style.expandAllBtn} onClick={expandAllYears}>
                {t('all')} {t('archives')}
              </button>
            </div>
          ) : null}
        </div>
      }
      rightNode={
        <ArchiveSidebar categories={categories} setting={setting} className={indexStyle.footer} />
      }
    />
  );
};

export default Archives;
