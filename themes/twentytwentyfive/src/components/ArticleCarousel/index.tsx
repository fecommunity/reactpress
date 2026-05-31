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
  const slides = (articles || []).filter((article) => article.cover).slice(0, 6);
  const [active, setActive] = useState(0);

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
    <div className={style.wrapper}>
      <div className={style.track} aria-live="polite">
        {slides.map((article, index) => {
          const coverSrc = resolveImageUrl(article.cover, 'large');
          const isActive = index === active;
          return (
            <article
              key={article.id}
              className={style.slide}
              data-active={isActive || undefined}
              aria-hidden={!isActive}
            >
              <img
                src={coverSrc}
                alt=""
                aria-hidden="true"
                className={style.coverImg}
                width={1200}
                height={460}
                decoding={index === 0 ? 'sync' : 'async'}
                  fetchpriority={index === 0 ? 'high' : undefined}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
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
        <div className={style.dots} aria-hidden>
          {slides.map((article, index) => (
            <button
              key={article.id}
              type="button"
              className={style.dot}
              data-active={index === active || undefined}
              onClick={() => setActive(index)}
              tabIndex={-1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
