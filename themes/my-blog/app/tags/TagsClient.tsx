'use client';

import AboutUs from '@/components/reactpress/AboutUs';
import ArticleRecommend from '@/components/reactpress/ArticleRecommend';
import DoubleColumnLayout from '@/components/reactpress/DoubleColumnLayout';
import TagsWidget from '@/components/reactpress/TagsWidget';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import type { ITag } from '@fecommunity/reactpress-toolkit/types';

interface TagsClientProps {
  tags: ITag[];
}

export default function TagsClient({ tags }: TagsClientProps) {
  const { t } = useLocale();

  return (
    <DoubleColumnLayout
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
        <div className="rp-sidebar-sticky sticky mb-4 w-72">
          <ArticleRecommend mode="inline" deferFetch />
          <AboutUs />
        </div>
      }
    />
  );
}
