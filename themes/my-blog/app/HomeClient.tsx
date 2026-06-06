'use client';

import ArticleCarousel from '@/components/reactpress/ArticleCarousel';
import ArticleFeedSection from '@/components/reactpress/ArticleFeedSection';
import ArticleList from '@/components/reactpress/ArticleList';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import HomeSidebar from '@/components/reactpress/HomeSidebar';
import { ArticleProvider } from '@/src/providers';
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
            <div className="mb-4 overflow-hidden rounded-lg bg-[var(--bg-second)] shadow-[var(--box-shadow)]">
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
