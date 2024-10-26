import { EyeOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
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
              <div className={style.coverWrapper}>
                {article.cover && (
                  <LazyLoad height={120}>
                    <div className={style.coverWrapper}>
                      <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                        <img src={article.cover} alt="cover" />
                      </Link>
                    </div>
                  </LazyLoad>
                )}
              </div>
              <div className={style.articleWrapper}>
                <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                  <a aria-label={article.title} className={style.link}>
                    <header>
                      <div className={style.title}>{article.title}</div>
                      <div className={style.info}>
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
                        <div className={style.desc}>
                          <span dangerouslySetInnerHTML={{ __html: article.summary }} />
                        </div>
                        <div className={style.meta}>
                          <div>
                            <span>
                              <HeartOutlined />
                              <span className={style.number}>{article.likes}</span>
                            </span>
                            <span className={style.separator}>·</span>
                            <span>
                              <EyeOutlined />
                              <span className={style.number}>{article.views}</span>
                            </span>
                          </div>
                          <span className={style.time}>
                            <HistoryOutlined />
                            <LocaleTime date={article.publishAt} format="yyyy-MM-dd" />
                          </span>
                        </div>
                      </div>
                    </main>
                  </a>
                </Link>
              </div>
              <span className={style.badge} />
            </div>
          );
        })
      ) : (
        <div className={'empty'}>{t('empty')}</div>
      )}
    </div>
  );
};
