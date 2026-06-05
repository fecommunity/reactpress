import { Button, Input, Space } from '@/ui';
import type { GetServerSideProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import AboutUs from '@/components/AboutUs';
import { ArticleList } from '@/components/ArticleList';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Categories } from '@/components/Categories';
import { Tags } from '@/components/Tags';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import {
  fetchSearchPageProps,
  sanitizeNextProps,
  themeApi,
  useSiteCatalog,
  useSiteSetting,
} from '@fecommunity/reactpress-toolkit/theme';

import style from './index.module.scss';

interface SearchPageProps {
  keyword: string;
  articles: IArticle[];
}

const SearchPage: NextPage<SearchPageProps> = ({ keyword: initialKeyword = '', articles: initialArticles = [] }) => {
  const t = useTranslations();
  const router = useRouter();
  const setting = useSiteSetting();
  const { tags, categories } = useSiteCatalog();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [articles, setArticles] = useState<IArticle[]>(initialArticles);

  useEffect(() => {
    setKeyword(initialKeyword);
    setArticles(initialArticles);
  }, [initialArticles, initialKeyword]);

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        router.push('/search', undefined, { shallow: false });
        return;
      }
      router.push(`/search?keyword=${encodeURIComponent(trimmed)}`, undefined, { shallow: false });
    },
    [router],
  );

  return (
    <div className={style.wrapper}>
      <Head>
        <title>
          {initialKeyword
            ? `${initialKeyword} - ${t('searchArticle')} - ${setting.systemTitle}`
            : `${t('searchArticle')} - ${setting.systemTitle}`}
        </title>
      </Head>
      <DoubleColumnLayout
        leftNode={
          <>
            <header className={style.header} role="search">
              <h1 className={style.title}>{t('searchArticle')}</h1>
              <div className={style.searchField}>
                <Space.Compact block className={style.searchCompact}>
                  <Input
                    ref={inputRef}
                    size="large"
                    allowClear
                    value={keyword}
                    placeholder={t('searchArticlePlaceholder') as string}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={() => runSearch(keyword)}
                  />
                  <Button type="primary" size="large" onClick={() => runSearch(keyword)}>
                    {t('search')}
                  </Button>
                </Space.Compact>
              </div>
            </header>
            {initialKeyword ? (
              <p className={style.summary}>
                {t('totalSearch')} <span>{articles.length}</span> {t('piece')}
                {initialKeyword ? (
                  <>
                    {' · '}
                    <span className={style.keyword}>&ldquo;{initialKeyword}&rdquo;</span>
                  </>
                ) : null}
              </p>
            ) : null}
            <main className={style.result}>
              {initialKeyword ? (
                articles.length ? (
                  <ArticleList articles={articles} />
                ) : (
                  <div className="empty">{t('empty')}</div>
                )
              ) : null}
            </main>
          </>
        }
        rightNode={
          <div className="sticky">
            <ArticleRecommend mode="inline" />
            <Tags tags={tags} />
            <Categories categories={categories} />
            <AboutUs className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const rawKeyword = ctx.query.keyword;
  const keyword =
    typeof rawKeyword === 'string'
      ? rawKeyword.trim()
      : Array.isArray(rawKeyword)
        ? (rawKeyword[0] ?? '').trim()
        : '';

  try {
    const data = await fetchSearchPageProps(themeApi, keyword);
    return {
      props: sanitizeNextProps({
        ...data,
        needLayoutFooter: false,
      }),
    };
  } catch {
    return {
      props: sanitizeNextProps({
        keyword,
        articles: [],
        needLayoutFooter: false,
      }),
    };
  }
};

export default SearchPage;
