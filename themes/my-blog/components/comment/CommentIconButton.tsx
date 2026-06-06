'use client';

import ArticleActionButton, { type ArticleActionVariant } from '@/components/widgets/ArticleActionButton';
import { COMMENT_DOM_ID } from '@/lib/utils/comment';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';

interface CommentIconButtonProps {
  variant?: ArticleActionVariant;
}

export default function CommentIconButton({ variant = 'floating' }: CommentIconButtonProps) {
  const { t } = useLocale();

  return (
    <ArticleActionButton
      label={t('comment')}
      onClick={() => {
        document.getElementById(COMMENT_DOM_ID)?.scrollIntoView({ behavior: 'smooth' });
      }}
      variant={variant}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    </ArticleActionButton>
  );
}
