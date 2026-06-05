import { Categories } from '@components/Categories';
import { KnowledgeList } from '@components/KnowledgeList';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { LoadMore } from '@/components/LoadMore';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers';
import {
  fetchKnowledgeIndexPageProps,
  themeApi,
  themeStaticProps,
  useSiteCatalog,
  useSiteSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme';

interface IHomeProps {
  books: IKnowledge[];
  total: number;
}

const pageSize = 12;

export const getStaticProps: GetStaticProps = async () => {
  try {
    const data = await withApiRetry(() => fetchKnowledgeIndexPageProps(themeApi, pageSize));
    return themeStaticProps({ ...data, needLayoutFooter: true });
  } catch (error) {
    console.error('[reactpress] fetch knowledge index', error);
    return themeStaticProps({ books: [], total: 0, needLayoutFooter: true });
  }
};

const KnowledgeIndex: NextPage<IHomeProps> = ({ books: defaultBooks = [], total = 0 }) => {
  const { categories } = useSiteCatalog();
  const setting = useSiteSetting();
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<IKnowledge[]>(defaultBooks);

  useEffect(() => {
    setBooks(defaultBooks);
  }, [defaultBooks]);

  const getArticles = useCallback((nextPage: number) => {
    KnowledgeProvider.getKnowledges({
      page: nextPage,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(nextPage);
      setBooks((prev) => [...prev, ...res[0]]);
    });
  }, []);

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          <Head>
            <title>{`${t('knowledge')} - ${setting.systemTitle}`}</title>
          </Head>
          <LoadMore
            pageStart={1}
            loadMore={getArticles}
            hasMore={page * pageSize < total}
            loader={
              <div className={'loading'} key={0}>
                {t('gettingKnowledge')}
              </div>
            }
          >
            <KnowledgeList knowledges={books} />
          </LoadMore>
        </>
      }
      rightNode={
        <div className={'sticky'}>
          <ArticleRecommend mode="inline" />
          <Categories categories={categories} />
        </div>
      }
    />
  );
};

export default KnowledgeIndex;
