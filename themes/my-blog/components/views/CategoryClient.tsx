'use client';

import ArchiveBanner from '@/components/article/ArchiveBanner';
import ArticleFeedSection from '@/components/article/ArticleFeedSection';
import ArticleList from '@/components/article/ArticleList';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import { ArticleProvider } from '@/lib/providers/client';
import { getArchiveBannerImage } from '@/lib/utils/archiveBanner';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { slimArticlesForList, type ListArticle } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface CategoryClientProps {
  initialArticles: ListArticle[];
  total: number;
  category: { value: string; label: string };
}

const pageSize = 12;

export default function CategoryClient({
  initialArticles = [],
  total = 0,
  category,
}: CategoryClientProps) {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<ListArticle[]>(initialArticles);
  const banner = useMemo(() => getArchiveBannerImage(articles), [articles]);

  useEffect(() => {
    setArticles(initialArticles);
    setPage(1);
  }, [initialArticles]);

  const getArticles = useCallback(
    (nextPage: number) => {
      return ArticleProvider.getArticlesByCategory(category.value, {
        page: nextPage,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(nextPage);
        setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
      });
    },
    [category.value],
  );

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          <ArchiveBanner
            className="mb-4"
            imageUrl={banner.url}
            isBrandFallback={banner.isBrandFallback}
            title={
              <>
                <span>{category.label}</span> {t('categoryArticle')}
              </>
            }
            subtitle={
              <>
                {t('totalSearch')} <span>{total}</span> {t('piece')}
              </>
            }
          />
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
