'use client';

import BookmarkWidget from '@/components/widgets/BookmarkWidget';
import LikesWidget from '@/components/widgets/LikesWidget';
import { COMMENT_DOM_ID } from '@/lib/utils/comment';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

interface ArticleActionsBarProps {
  articleId: string;
  likes: number;
  likesApi: (id: string, type: 'like' | 'dislike') => Promise<number>;
  showCommentLink?: boolean;
}

export default function ArticleActionsBar({
  articleId,
  likes,
  likesApi,
  showCommentLink = false,
}: ArticleActionsBarProps) {
  const { t } = useLocale();

  return (
    <div className="rp-article-actions-bar">
      <LikesWidget defaultCount={likes} id={articleId} api={likesApi} variant="inline" />
      <BookmarkWidget id={articleId} variant="inline" />
      {showCommentLink ? (
        <button
          type="button"
          className="rp-action-btn rp-action-btn--inline"
          aria-label={t('comment')}
          onClick={() => {
            document.getElementById(COMMENT_DOM_ID)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="rp-action-btn__icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
          </span>
          <span className="rp-action-btn__label">{t('comment')}</span>
        </button>
      ) : null}
    </div>
  );
}
