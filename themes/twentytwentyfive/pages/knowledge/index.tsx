import { Categories } from '@components/Categories';
import { KnowledgeList } from '@components/KnowledgeList';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers/knowledge';

interface IHomeProps {
  books: IKnowledge[];
  total: number;
}

const pageSize = 12;

const Page: NextPage<IHomeProps> = ({ books: defaultBooks = [], total = 0 }) => {
  const { categories, setting } = useContext(GlobalContext);
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<IKnowledge[]>(defaultBooks);

  useEffect(() => {
    setBooks(defaultBooks);
  }, [defaultBooks]);

  const getArticles = useCallback((page) => {
    KnowledgeProvider.getKnowledges({
      page,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(page);
      setBooks((articles) => [...articles, ...res[0]]);
    });
  }, []);

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          <Head>
            <title>{`${t('knowledge')} - ${setting.systemTitle}`}</title>
          </Head>
          <InfiniteScroll
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
          </InfiniteScroll>
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

Page.getInitialProps = async () => {
  const [books, total] = await KnowledgeProvider.getKnowledges({
    page: 1,
    pageSize,
    status: 'publish',
  });
  return {
    books,
    total,
    needLayoutFooter: true,
  };
};

export default Page;
