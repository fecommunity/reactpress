/**
 * ArticleList Component
 * 
 * This component displays a list of articles in a card format.
 * Each article card includes:
 * - Cover image (with lazy loading)
 * - Title
 * - Category tag
 * - Summary
 * - Meta information (likes, views, publish date)
 * 
 * Features:
 * - Lazy loading for images
 * - Responsive design
 * - Category navigation
 * - Article statistics display
 */

import { EyeOutlined, FolderOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useContext, useMemo } from 'react';
import LazyLoad from 'react-lazyload';
import LogoSvg from '../../assets/LogoSvg';

import { LocaleTime } from '@/components/LocaleTime';
import { GlobalContext } from '@/context/global';
import { getColorFromNumber } from '@/utils';
import style from './index.module.scss';

interface Article {
  id: string;
  title: string;
  cover?: string;
  summary: string;
  category?: {
    value: string;
    label: string;
  };
  likes: number;
  views: number;
  publishAt: string;
}

interface ArticleListProps {
  articles: Article[];
  coverHeight?: number;
  asRecommend?: boolean;
}

/**
 * ArticleCard Component
 * Renders a single article card with all its details
 */
const ArticleCard: React.FC<{ article: Article; categoryIndex: number }> = ({ article, categoryIndex }) => {
  return (
    <div className={style.articleItem}>
      {/* Cover Image Section */}
      <div className={style.coverWrapper}>
        {article.cover ? (
          <LazyLoad height={120} placeholder={<Spin />}>
            <div className={style.coverWrapper}>
              <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                <img src={article.cover} alt={`${article.title} cover`} loading="lazy" />
              </Link>
            </div>
          </LazyLoad>
        ) : (
          <LogoSvg />
        )}
      </div>

      {/* Article Content Section */}
      <div className={style.articleWrapper}>
        <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
          <a aria-label={article.title} className={style.link}>
            <header>
              <div className={style.title} title={article.title}>
                {article.title}
              </div>
              <div className={style.info}>
                {article.category && categoryIndex >= 0 && (
                  <Link
                    href={`/category/${article?.category?.value}`}
                    as={`/category/${article?.category?.value}`}
                    scroll={false}
                  >
                    <Tag className={style.antBadge} icon={<FolderOutlined />}>
                      <span className={style.category}>{article.category?.label}</span>
                    </Tag>
                  </Link>
                )}
              </div>
            </header>

            {/* Article Summary and Meta Information */}
            <main className={style.desc} title={article.title}>
              <div className={style.contentWrapper}>
                <div className={style.desc} title={article.summary}>
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
};

/**
 * Main ArticleList Component
 * Renders a list of article cards with proper handling of empty state
 */
export const ArticleList: React.FC<ArticleListProps> = ({ articles = [] }) => {
  const t = useTranslations();
  const { categories } = useContext(GlobalContext);

  // Memoize the category indices to avoid recalculating on every render
  const categoryIndices = useMemo(() => {
    return articles.map(article => 
      categories?.findIndex((category) => category?.value === article?.category?.value)
    );
  }, [articles, categories]);

  return (
    <div className={style.wrapper}>
      {articles && articles.length ? (
        articles.map((article, index) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            categoryIndex={categoryIndices[index]} 
          />
        ))
      ) : (
        <div className={'empty'}>{t('empty')}</div>
      )}
    </div>
  );
};
