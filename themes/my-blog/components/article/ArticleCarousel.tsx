'use client';

import { resolveImageUrl, type CarouselArticle } from '@fecommunity/reactpress-toolkit/theme';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import Link from '@/components/shared/Link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_MS = 5000;

interface ArticleCarouselProps {
  articles?: CarouselArticle[];
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export default function ArticleCarousel({ articles = [] }: ArticleCarouselProps) {
  const { t } = useLocale();
  const slides = useMemo(
    () => (articles || []).filter((article) => article.cover).slice(0, 6),
    [articles],
  );
  const slideIdsKey = useMemo(() => slides.map((article) => article.id).join(','), [slides]);
  const [active, setActive] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearAutoplay = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length <= 1) return;
      const normalized = ((index % slides.length) + slides.length) % slides.length;
      setActive(normalized);
    },
    [slides.length],
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    setLoadedSlides((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  useEffect(() => {
    setActive(0);
    setLoadedSlides(new Set([0]));
  }, [slideIdsKey]);

  useEffect(() => {
    clearAutoplay();
    if (slides.length <= 1 || paused) return undefined;

    timerRef.current = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return clearAutoplay;
  }, [clearAutoplay, paused, slideIdsKey, slides.length]);

  if (!slides.length) return null;

  const showControls = slides.length > 1;
  const navBtnClass =
    'absolute top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 p-0 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 md:h-9 md:w-9 md:opacity-0 md:group-hover/carousel:opacity-100 md:group-focus-within/carousel:opacity-100';

  return (
    <section
      className="group/carousel relative isolate overflow-hidden rounded-lg bg-[var(--bg-second)] shadow-[var(--box-shadow)]"
      aria-roledescription="carousel"
      aria-label={t('recommendToReading')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="relative h-[320px] sm:h-[340px] md:h-[300px] lg:h-[380px] xl:h-[420px] min-[1360px]:h-[480px]"
        aria-live="polite"
      >
        {slides.map((article, index) => {
          const coverSrc = resolveImageUrl(article.cover, index === 0 ? 'medium' : 'thumb');
          const isActive = index === active;
          const shouldLoadImage = loadedSlides.has(index);

          return (
            <article
              key={article.id}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
              aria-hidden={!isActive}
            >
              {shouldLoadImage ? (
                <img
                  src={coverSrc}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out will-change-transform ${
                    isActive ? 'scale-[1.04]' : 'scale-100'
                  }`}
                  width={1200}
                  height={460}
                  decoding={index === 0 ? 'sync' : 'async'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="absolute inset-0 bg-[var(--bg-second)]" aria-hidden />
              )}

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                aria-hidden
              />

              <Link
                href={`/article/${article.id}`}
                tabIndex={isActive ? 0 : -1}
                className="absolute inset-0 z-10 flex flex-col justify-end no-underline"
              >
                <div className="px-5 pb-10 pt-16 text-left md:px-7 md:pb-11 lg:px-8">
                  <h2 className="m-0 mb-2 max-w-xl line-clamp-2 text-[1.05rem] font-semibold leading-snug tracking-tight text-white md:max-w-2xl md:text-xl lg:text-[1.35rem]">
                    {article.title}
                  </h2>
                  <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65 md:text-[0.8125rem]">
                    <LocaleTime date={article.publishAt} timeago />
                    <span className="text-white/35" aria-hidden>
                      /
                    </span>
                    <span>
                      {article.views} {t('readingCountTemplate')}
                    </span>
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            className={`${navBtnClass} left-3 opacity-80 max-md:left-2.5`}
            aria-label={`上一张，第 ${active + 1} 张，共 ${slides.length} 张`}
            onClick={goPrev}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className={`${navBtnClass} right-3 opacity-80 max-md:right-2.5`}
            aria-label={`下一张，第 ${active + 1} 张，共 ${slides.length} 张`}
            onClick={goNext}
          >
            <ChevronIcon direction="right" />
          </button>

          <div
            className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
            role="tablist"
            aria-label={t('recommendToReading')}
          >
            {slides.map((article, index) => {
              const isDotActive = index === active;
              return (
                <button
                  key={article.id}
                  type="button"
                  role="tab"
                  aria-selected={isDotActive}
                  aria-label={`${index + 1} / ${slides.length}`}
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
                  onClick={() => goTo(index)}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ease-out ${
                      isDotActive ? 'h-1.5 w-4 bg-white' : 'h-1.5 w-1.5 bg-white/35 hover:bg-white/55'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
