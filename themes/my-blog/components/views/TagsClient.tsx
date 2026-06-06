'use client';

import ArticleRecommend from '@/components/article/ArticleRecommend';
import DoubleColumnLayout from '@/components/layout/DoubleColumnLayout';
import HomeSidebar from '@/components/widgets/HomeSidebar';
import TagsWidget from '@/components/widgets/TagsWidget';
import { FEED_PAGE_SIZE } from '@/lib/reactpress/feedFooterPlacement';
import { useFeedFooterPlacement } from '@/lib/reactpress/useFeedFooterPlacement';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';

interface TagsClientProps {
  tags: ITag[];
}

export default function TagsClient({ tags }: TagsClientProps) {
  const { t } = useLocale();
  const { footerInSidebar, footerAtBottom } = useFeedFooterPlacement({
    itemCount: tags.length,
    pageSize: FEED_PAGE_SIZE,
  });

  return (
    <DoubleColumnLayout
      fillMinHeight={footerAtBottom}
      leftNode={
        <div className="overflow-hidden rounded-lg bg-[var(--bg-box)] p-6 shadow-[var(--box-shadow)]">
          <h1 className="m-0 text-2xl font-semibold text-[var(--main-text-color)]">{t('tagTitle')}</h1>
          <p className="mt-2 text-sm text-[var(--second-text-color)]">{tags.length} tags</p>
          <div className="mt-6">
            <TagsWidget tags={tags} needTitle={false} />
          </div>
        </div>
      }
      rightNode={
        <HomeSidebar
          showTags={false}
          showCategories
          showAboutUs={footerInSidebar}
          deferRecommend={false}
        />
      }
    />
  );
}
