import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';

import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import { resolveImageUrl } from '@fecommunity/reactpress-toolkit/theme';

import style from './index.module.scss';

interface IProps {
  articles?: IArticle[];
}

export const ArticleCarousel: React.FC<IProps> = ({ articles = [] }) => {
  const t = useTranslations();
  const slides = useMemo(() => (articles || []).filter((article) => article.cover).slice(0, 6), [articles]);
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
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className={style.wrapper} aria-roledescription="carousel" aria-label={t('recommendToReading') as string}>
      <div className={style.track} aria-live="polite">
        {slides.map((article, index) => {
          const coverSrc = resolveImageUrl(article.cover, 'large');
          const isActive = index === active;
          const shouldLoadImage = loadedSlides.has(index);

          return (
            <article
              key={article.id}
              className={style.slide}
              data-active={isActive || undefined}
              aria-hidden={!isActive}
            >
              {shouldLoadImage ? (
                <img
                  src={coverSrc}
                  alt={article.title}
                  className={style.coverImg}
                  width={1200}
                  height={460}
                  decoding={index === 0 ? 'sync' : 'async'}
                  fetchpriority={index === 0 ? 'high' : undefined}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className={style.coverImg} aria-hidden />
              )}
              <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false} prefetch={false}>
                <a tabIndex={isActive ? 0 : -1}>
                  <div className={style.info}>
                    <h2 className={style.title}>{article.title}</h2>
                    <p>
                      <span>
                        <LocaleTime date={article.publishAt} timeago={true} />
                      </span>
                      <span className={style.seperator}>·</span>
                      <span>
                        {article.views} {t('readingCountTemplate')}
                      </span>
                    </p>
                  </div>
                </a>
              </Link>
            </article>
          );
        })}
      </div>
      {slides.length > 1 ? (
        <div className={style.dots} role="tablist" aria-label={t('recommendToReading') as string}>
          {slides.map((article, index) => (
            <button
              key={article.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`${index + 1} / ${slides.length}`}
              className={style.dot}
              data-active={index === active || undefined}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
