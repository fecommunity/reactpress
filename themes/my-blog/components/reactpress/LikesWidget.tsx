'use client';

import { useCallback, useEffect, useState } from 'react';

interface LikesWidgetProps {
  defaultCount?: number;
  id: string;
  api: (id: string, type: 'like' | 'dislike') => Promise<number>;
}

export default function LikesWidget({ defaultCount = 0, id, api }: LikesWidgetProps) {
  const [count, setCount] = useState(defaultCount);
  const [liked, setLiked] = useState(false);

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
    <button
      type="button"
      aria-label="Like"
      onClick={toggle}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-box)] text-[var(--primary-color)] shadow-[var(--box-shadow)] transition-colors hover:bg-[var(--bg-second)] ${
        liked ? 'text-[var(--primary-color)]' : 'text-[var(--second-text-color)]'
      }`}
    >
      <svg viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor" aria-hidden>
        <path d="M859.8 191.2c-80.8-84.2-212-84.2-292.8 0L512 248.2l-55-57.2c-81-84.2-212-84.2-292.8 0-91 94.6-91 248.2 0 342.8L512 896l347.8-362C950.8 439.4 950.8 285.8 859.8 191.2z" />
      </svg>
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-[var(--primary-color)] px-1 text-xs text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
