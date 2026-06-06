'use client';

import ArticleActionButton, { type ArticleActionVariant } from '@/components/widgets/ArticleActionButton';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useState } from 'react';

interface LikesWidgetProps {
  defaultCount?: number;
  id: string;
  api: (id: string, type: 'like' | 'dislike') => Promise<number>;
  variant?: ArticleActionVariant;
}

export default function LikesWidget({ defaultCount = 0, id, api, variant = 'floating' }: LikesWidgetProps) {
  const { locale } = useSiteCatalog();
  const [count, setCount] = useState(defaultCount);
  const [liked, setLiked] = useState(false);
  const label = locale === 'zh' ? '点赞' : 'Like';

  useEffect(() => {
    setCount(defaultCount);
  }, [defaultCount]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('LIKES') || '[]') as string[];
      setLiked(stored.includes(id));
    } catch {
      setLiked(false);
    }
  }, [id]);

  const toggle = useCallback(() => {
    const type = liked ? 'dislike' : 'like';
    api(id, type).then((next) => {
      setCount(next);
      try {
        const stored = JSON.parse(window.localStorage.getItem('LIKES') || '[]') as string[];
        const nextStored = liked ? stored.filter((item) => item !== id) : [...stored, id];
        window.localStorage.setItem('LIKES', JSON.stringify(nextStored));
        setLiked(!liked);
      } catch {
        setLiked(!liked);
      }
    });
  }, [api, id, liked]);

  return (
    <ArticleActionButton
      active={liked}
      label={label}
      count={count}
      onClick={toggle}
      variant={variant}
      activeClassName="is-liked"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </ArticleActionButton>
  );
}
