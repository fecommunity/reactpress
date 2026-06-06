'use client';

import ArchiveBanner from '@/components/article/ArchiveBanner';
import ArticleFeedSection from '@/components/article/ArticleFeedSection';
import ArticleList from '@/components/article/ArticleList';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import TagsWidget from '@/components/widgets/TagsWidget';
import { ArticleProvider } from '@/lib/providers/client';
import { getArchiveBannerImage } from '@/lib/utils/archiveBanner';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  slimArticlesForList,
  useSiteCatalog,
  type ListArticle,
} from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TagArchiveClientProps {
  initialArticles: ListArticle[];
  total: number;
  tag: { value: string; label: string };
}

const pageSize = 12;

export default function TagArchiveClient({
  initialArticles = [],
  total = 0,
  tag,
}: TagArchiveClientProps) {
  const { t } = useLocale();
  const { tags } = useSiteCatalog();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState(initialArticles);
  const banner = useMemo(() => getArchiveBannerImage(articles), [articles]);

  useEffect(() => {
    setArticles(initialArticles);
    setPage(1);
  }, [initialArticles]);

  const getArticles = useCallback(
    (nextPage: number) => {
      return ArticleProvider.getArticlesByTag(tag.value, {
        page: nextPage,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(nextPage);
        setArticles((prev) => [...prev, ...slimArticlesForList(res[0])]);
      });
    },
    [tag.value],
  );

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          <ArchiveBanner
            imageUrl={banner.url}
            isBrandFallback={banner.isBrandFallback}
            title={
              <>
                {t('yu')} <span>{tag.label}</span> {t('tagRelativeArticles')}
              </>
            }
            subtitle={
              <>
                {t('totalSearch')} <span>{total}</span> {t('piece')}
              </>
            }
          />
          <TagsWidget tags={tags as Parameters<typeof TagsWidget>[0]['tags']} />
          <ArticleFeedSection
            showCategoryMenu={false}
            pageStart={1}
            loadMore={getArticles}
            hasMore={page * pageSize < total}
          >
            <ArticleList articles={articles} />
          </ArticleFeedSection>
        </>
      }
      rightNode={<HomeSidebar showTags={false} showCategories deferRecommend={false} />}
    />
  );
}
