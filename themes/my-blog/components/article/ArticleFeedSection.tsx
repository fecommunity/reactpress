'use client';

import CategoryMenu from '@/components/article/CategoryMenu';
import LoadMore from '@/components/article/LoadMore';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import type { ReactNode } from 'react';

interface ArticleFeedSectionProps {
  children: ReactNode;
  pageStart?: number;
  loadMore: (page: number) => void | Promise<void>;
  hasMore: boolean;
  showCategoryMenu?: boolean;
}

/** Shared home/category article list block — matches twentytwentyfive `leftWrap`. */
export default function ArticleFeedSection({
  children,
  pageStart = 1,
  loadMore,
  hasMore,
  showCategoryMenu = true,
}: ArticleFeedSectionProps) {
  const { t } = useLocale();
  const { categories } = useSiteCatalog();

  return (
    <div className="w-full overflow-hidden rounded-lg">
      {showCategoryMenu ? (
        <header className="overflow-hidden rounded-t-lg bg-[var(--bg-box)]">
          <CategoryMenu categories={categories as Array<{ value: string; label: string }>} />
        </header>
      ) : null}
      <main className="mb-16 w-full pt-4 [&_.rp-article-list]:w-full [&_.rp-article-list]:rounded-none [&_.rp-article-list]:shadow-none">
        <LoadMore
          pageStart={pageStart}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={
            <div className="loading py-6 text-center text-sm text-[var(--second-text-color)]" key={0}>
              {t('gettingArticle')}
            </div>
          }
        >
          {children}
        </LoadMore>
      </main>
    </div>
  );
}
