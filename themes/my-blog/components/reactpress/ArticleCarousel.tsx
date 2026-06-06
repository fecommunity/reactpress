'use client';

import { resolveImageUrl, type CarouselArticle } from '@fecommunity/reactpress-toolkit/theme';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import Link from '@/components/Link';
import { useEffect, useMemo, useState } from 'react';

interface ArticleCarouselProps {
  articles?: CarouselArticle[];
}

export default function ArticleCarousel({ articles = [] }: ArticleCarouselProps) {
  const { t } = useLocale();
  const slides = useMemo(
    () => (articles || []).filter((article) => article.cover).slice(0, 6),
    [articles],
  );
  const [active, setActive] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));

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
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="relative overflow-hidden rounded-lg bg-[var(--bg-second)] shadow-[var(--box-shadow)]"
      aria-roledescription="carousel"
      aria-label={t('recommendToReading')}
    >
      <div
        className="relative h-[300px] md:h-[260px] lg:h-[340px] xl:h-[380px] min-[1360px]:h-[460px]"
        aria-live="polite"
      >
        {slides.map((article, index) => {
          const coverSrc = resolveImageUrl(article.cover, index === 0 ? 'medium' : 'thumb');
          const isActive = index === active;
          const shouldLoadImage = loadedSlides.has(index);

          return (
            <article
              key={article.id}
              className="absolute inset-0 transition-opacity duration-[600ms] ease-in-out"
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
              aria-hidden={!isActive}
            >
              {shouldLoadImage ? (
                <img
                  src={coverSrc}
                  alt={article.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  width={1200}
                  height={460}
                  decoding={index === 0 ? 'sync' : 'async'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="absolute inset-0 bg-[var(--bg-second)]" aria-hidden />
              )}
              <Link
                href={`/article/${article.id}`}
                tabIndex={isActive ? 0 : -1}
                className="relative z-10 block h-full w-full no-underline"
              >
                <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-black/35 px-4 text-center text-[var(--font-color-base)]">
                  <h2 className="m-0 mx-4 mb-2 line-clamp-2 text-base font-semibold md:text-xl">
                    {article.title}
                  </h2>
                  <p className="m-0 text-sm">
                    <LocaleTime date={article.publishAt} timeago />
                    <span className="mx-1">·</span>
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
      {slides.length > 1 ? (
        <div
          className="absolute right-3 bottom-3 z-20 flex gap-2"
          role="tablist"
          aria-label={t('recommendToReading')}
        >
          {slides.map((article, index) => (
            <button
              key={article.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`${index + 1} / ${slides.length}`}
              className="h-2 w-2 cursor-pointer rounded-full border-0 p-0 transition-colors"
              style={{ background: index === active ? '#fff' : 'rgba(255,255,255,0.72)' }}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
