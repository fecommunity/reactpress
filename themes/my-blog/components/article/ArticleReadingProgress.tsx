'use client';

import { useHeaderTop } from '@/lib/utils/headerPosition';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ARTICLE_SELECTOR = '#js-article-wrapper';

function measureProgress(): number {
  const article = document.querySelector(ARTICLE_SELECTOR);
  if (!article) return 0;

  const rect = article.getBoundingClientRect();
  const articleHeight = rect.height;
  const viewportHeight = window.innerHeight;
  const scrollable = articleHeight - viewportHeight;

  if (scrollable <= 0) {
    return rect.top <= 0 ? 100 : 0;
  }

  const scrolled = -rect.top;
  return Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
}

export default function ArticleReadingProgress() {
  const headerTop = useHeaderTop();
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setProgress(measureProgress());
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="rp-reading-progress"
      style={{ top: headerTop }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="rp-reading-progress__bar"
        style={{ width: `${progress}%` }}
      />
    </div>,
    document.body,
  );
}
