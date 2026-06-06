'use client';

import { COMMENT_DOM_ID } from '@/src/utils/comment';

export default function CommentIconButton() {
  return (
    <button
      type="button"
      aria-label="Comment"
      onClick={() => {
        const el = document.getElementById(COMMENT_DOM_ID);
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-box)] text-[var(--main-text-color)] shadow-[var(--box-shadow)] hover:text-[var(--primary-color)]"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    </button>
  );
}
