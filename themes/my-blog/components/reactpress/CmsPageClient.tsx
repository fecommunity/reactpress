'use client';

import ArticleRecommend from '@/components/reactpress/ArticleRecommend';
import CommentSection from '@/components/reactpress/CommentSection';
import ReadingContent from '@/components/reactpress/ReadingContent';
import { PageProvider } from '@/src/providers';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { Image, ImageViewer } from '@fecommunity/reactpress-toolkit/ui/content';
import type { IPage } from '@fecommunity/reactpress-toolkit/types';
import { useEffect } from 'react';

interface CmsPageClientProps {
  page: IPage;
}

export default function CmsPageClient({ page }: CmsPageClientProps) {
  const { t } = useLocale();
  const isSuggestionsPage = page.path === 'suggestions';

  useEffect(() => {
    PageProvider.updatePageViews(page.id);
  }, [page.id]);

  return (
    <ImageViewer containerSelector="#js-page-wrapper">
      <div id="js-page-wrapper" className="rp-cms-page relative bg-[var(--bg-box)]">
        <div
          className="rp-cms-page-inner border-b border-[var(--border-color)] pt-5"
          style={{
            backgroundColor: 'var(--bg-second)',
          }}
        >
          {page.cover ? (
            <div className="rp-cms-cover mx-auto max-w-3xl px-2 pb-6">
              <Image url={page.cover} size="large" alt={t('articleCover')} className="w-full rounded-lg" />
            </div>
          ) : null}
          <div className="rp-cms-content mx-auto max-w-3xl px-2 pb-5">
            <ReadingContent content={page.html} />
          </div>
        </div>

        {!isSuggestionsPage ? (
          <>
            <div className="rp-comment-wrap mx-auto max-w-3xl px-4 py-4">
              <p className="rp-cms-section-title">{t('comment')}</p>
              <div className="rp-comment-panel">
                <CommentSection hostId={page.id} />
              </div>
            </div>
            <div className="rp-cms-recommend mx-auto max-w-3xl px-4 py-4">
              <p className="rp-cms-section-title">{t('recommendToReading')}</p>
              <div className="overflow-hidden rounded-lg shadow-[var(--box-shadow)]">
                <ArticleRecommend needTitle={false} mode="inline" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ImageViewer>
  );
}
