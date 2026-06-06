'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`rp-back-to-top fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-lg text-[var(--second-text-color)] shadow-[var(--box-shadow)] hover:text-[var(--primary-color)] ${
        visible ? 'is-visible' : ''
      }`}
    >
      ↑
    </button>
  );
}
