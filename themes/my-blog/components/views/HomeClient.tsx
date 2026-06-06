'use client';

import ArticleCarousel from '@/components/article/ArticleCarousel';
import ArticleFeedSection from '@/components/article/ArticleFeedSection';
import ArticleList from '@/components/article/ArticleList';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import { ArticleProvider } from '@/lib/providers/client';
import {
  slimArticlesForList,
  type CarouselArticle,
  type ListArticle,
} from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useState } from 'react';

interface HomeClientProps {
  initialArticles: ListArticle[];
  total: number;
  recommendedArticles: CarouselArticle[];
}

const pageSize = 12;

export default function HomeClient({
  initialArticles = [],
  recommendedArticles = [],
  total = 0,
}: HomeClientProps) {
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<ListArticle[]>(initialArticles);

  useEffect(() => {
    setArticles(initialArticles);
    setPage(1);
  }, [initialArticles]);

  const getArticles = useCallback((nextPage: number) => {
    return ArticleProvider.getArticles({
      page: nextPage,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(nextPage);
      setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
    });
  }, []);

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          {recommendedArticles?.some((article) => article.cover) ? (
            <div className="mb-5">
              <ArticleCarousel articles={recommendedArticles} />
            </div>
          ) : null}
          <ArticleFeedSection
            pageStart={1}
            loadMore={getArticles}
            hasMore={page * pageSize < total}
          >
            <ArticleList articles={articles} />
          </ArticleFeedSection>
        </>
      }
      rightNode={<HomeSidebar />}
    />
  );
}
