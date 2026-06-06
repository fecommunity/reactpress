'use client';

import ArticleRecommend from '@/components/reactpress/ArticleRecommend';
import CategoriesWidget from '@/components/reactpress/CategoriesWidget';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import KnowledgeList from '@/components/reactpress/KnowledgeList';
import LoadMore from '@/components/reactpress/LoadMore';
import { KnowledgeProvider } from '@/src/providers';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import type { IKnowledge } from '@fecommunity/reactpress-toolkit/types';
import { useCallback, useEffect, useState } from 'react';

interface KnowledgeClientProps {
  initialBooks: Array<IKnowledge & { children?: IKnowledge[] }>;
  total: number;
}

const pageSize = 12;

export default function KnowledgeClient({ initialBooks = [], total = 0 }: KnowledgeClientProps) {
  const { t } = useLocale();
  const { categories } = useSiteCatalog();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState(initialBooks);

  useEffect(() => {
    setBooks(initialBooks);
    setPage(1);
  }, [initialBooks]);

  const loadMore = useCallback((nextPage: number) => {
    return KnowledgeProvider.getKnowledges({
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
        <LoadMore
          pageStart={1}
          loadMore={loadMore}
          hasMore={page * pageSize < total}
          loader={<div className="py-6 text-center text-sm text-[var(--second-text-color)]">{t('gettingKnowledge')}</div>}
        >
          <KnowledgeList knowledges={books} />
        </LoadMore>
      }
      rightNode={
        <div className="rp-sidebar-sticky sticky mb-4 w-72">
          <ArticleRecommend mode="inline" deferFetch />
          <CategoriesWidget categories={categories as Parameters<typeof CategoriesWidget>[0]['categories']} />
        </div>
      }
    />
  );
}
