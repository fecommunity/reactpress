'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPublishDateShort } from '@fecommunity/reactpress-toolkit/theme';
import { useThemeT } from '../hooks/useThemeT';

interface ArticleCarouselProps {
  articles: Array<{
    id: string;
    title: string;
    cover?: string;
    publishAt?: string;
    views?: number;
  }>;
}

/** Hero carousel — client-style fade slides with overlay controls. */
export default function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const t = useThemeT();
  const slides = articles.filter((a) => a.cover).slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];
  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="hero-carousel">
      <Link
        href={`/article/${current.id}`}
        className="hero-slide"
        style={{ backgroundImage: `url(${current.cover})` }}
      >
        <div className="hero-slide-overlay">
          <h2>{current.title}</h2>
          <p className="hero-slide-meta">
            {current.publishAt ? formatPublishDateShort(current.publishAt) : ''}
            {current.views != null
              ? ` · ${current.views} ${t('common.viewsCarousel', 'views')}`
              : ''}
          </p>
        </div>
      </Link>
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="hero-nav hero-nav--prev"
            aria-label={t('carousel.prev', 'Previous slide')}
            onClick={(e) => {
              e.preventDefault();
              goPrev();
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-nav hero-nav--next"
            aria-label={t('carousel.next', 'Next slide')}
            onClick={(e) => {
              e.preventDefault();
              goNext();
            }}
          >
            ›
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={i === index ? 'active' : ''}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
