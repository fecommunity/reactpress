import { EyeOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';
import LazyLoad from 'react-lazyload';

import { LocaleTime } from '@/components/LocaleTime';

import style from './index.module.scss';

interface IProps {
  articles: IArticle[];
  coverHeight?: number;
  asRecommend?: boolean;
}

export const ArticleList: React.FC<IProps> = ({ articles = [] }) => {
  const t = useTranslations();

  return (
    <div className={style.wrapper}>
      {articles && articles.length ? (
        articles.map((article) => {
          return (
            <div key={article.id} className={style.articleItem}>
              <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                <a aria-label={article.title}>
                  <header>
                    <div className={style.title}>{article.title}</div>
                    <div className={style.info}>
                      <Divider type="vertical" />
                      <span className={style.time}>
                        <LocaleTime date={article.publishAt} timeago={true} />
                      </span>
                      {article.category && (
                        <>
                          <Divider type="vertical" />
                          <span className={style.time}>{article.category.label}</span>
                        </>
                      )}
                    </div>
                  </header>
                  <main>
                    <div className={style.contentWrapper}>
                      <div className={style.desc}>{article.summary}</div>
                      <div className={style.meta}>
                        <span>
                          <HeartOutlined />
                          <span className={style.number}>{article.likes}</span>
                        </span>
                        <span className={style.seperator}>·</span>
                        <span>
                          <EyeOutlined />
                          <span className={style.number}>{article.views}</span>
                        </span>
                      </div>
                    </div>

                    {article.cover && (
                      <LazyLoad height={120}>
                        <div className={style.coverWrapper}>
                          <img src={article.cover} alt="cover" />
                        </div>
                      </LazyLoad>
                    )}
                  </main>
                </a>
              </Link>
            </div>
          );
        })
      ) : (
        <div className={'empty'}>{t('empty')}</div>
      )}
    </div>
  );
};
