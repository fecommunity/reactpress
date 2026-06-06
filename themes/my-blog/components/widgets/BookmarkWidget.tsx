'use client';

import ArticleActionButton, { type ArticleActionVariant } from '@/components/widgets/ArticleActionButton';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'BOOKMARKS';

interface BookmarkWidgetProps {
  id: string;
  variant?: ArticleActionVariant;
}

function readBookmarks(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export default function BookmarkWidget({ id, variant = 'floating' }: BookmarkWidgetProps) {
  const { locale } = useSiteCatalog();
  const [bookmarked, setBookmarked] = useState(false);
  const label = locale === 'zh' ? '收藏' : 'Bookmark';

  useEffect(() => {
    setBookmarked(readBookmarks().includes(id));
  }, [id]);

  const toggle = useCallback(() => {
    const stored = readBookmarks();
    const nextStored = bookmarked ? stored.filter((item) => item !== id) : [...stored, id];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStored));
    setBookmarked(!bookmarked);
  }, [bookmarked, id]);

  return (
    <ArticleActionButton
      active={bookmarked}
      label={label}
      onClick={toggle}
      variant={variant}
      activeClassName="is-bookmarked"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </ArticleActionButton>
  );
}
