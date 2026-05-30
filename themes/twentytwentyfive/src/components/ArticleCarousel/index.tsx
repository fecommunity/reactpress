import { Carousel } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { LocaleTime } from '@fecommunity/reactpress-toolkit/theme';

import style from './index.module.scss';

interface IProps {
  articles?: IArticle[];
}

export const ArticleCarousel: React.FC<IProps> = ({ articles = [] }) => {
  const t = useTranslations();
  const slides = (articles || []).filter((article) => article.cover).slice(0, 6);

  if (!slides.length) {
    return null;
  }

  return (
    <div className={style.wrapper}>
      <Carousel arrows autoplay effect="fade">
        {slides.map((article) => {
            return (
              <div key={article.id}>
                <div className={style.articleItem} style={{ backgroundImage: `url(${article.cover})` }}>
                  <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                    <a aria-label={article.title}>
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
                </div>
              </div>
            );
        })}
      </Carousel>
    </div>
  );
};
