import { EyeOutlined, FolderOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useContext } from 'react';
import LazyLoad from 'react-lazyload';
import LogoSvg from '../../assets/LogoSvg';

import { LocaleTime } from '@/components/LocaleTime';

import { GlobalContext } from '@/context/global';
import { getColorFromNumber } from '@/utils';
import style from './index.module.scss';

interface IProps {
  articles: IArticle[];
  coverHeight?: number;
  asRecommend?: boolean;
}

export const ArticleList: React.FC<IProps> = ({ articles = [] }) => {
  const t = useTranslations();
  const { categories } = useContext(GlobalContext);

  return (
    <div className={style.wrapper}>
      {articles && articles.length ? (
        articles.map((article: IArticle) => {
          const categoryIndex = categories?.findIndex((category) => category?.value === article?.category?.value);
          return (
            <div key={article.id} className={style.articleItem}>
              <div className={style.coverWrapper}>
                {article.cover ? (
                  <LazyLoad height={120} placeholder={<Spin />}>
                    <div className={style.coverWrapper}>
                      <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                        <img src={article.cover} alt="cover" />
                      </Link>
                    </div>
                  </LazyLoad>
                ) : (
                  <LogoSvg />
                )}
              </div>
              <div className={style.articleWrapper}>
                <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                  <a aria-label={article.title} className={style.link}>
                    <header>
                      <div className={style.title}>{article.title}</div>
                      <div className={style.info}>
                        {article.category && categoryIndex >= 0 && (
                          <Tag className={style.antBadge} color={getColorFromNumber(categoryIndex)}>
                            <FolderOutlined />
                            <span className={style.category}>{article.category?.label}</span>
                          </Tag>
                        )}
                      </div>
                    </header>
                    <main title={style.desc}>
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
