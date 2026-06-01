import { EyeOutlined, LikeOutlined } from '@/icons';
import { ArticleList } from '@components/ArticleList';
import cls from 'classnames';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { ArticleProvider } from '@/providers';

import style from './index.module.scss';

interface IProps {
  articleId?: string;
  mode?: 'inline' | 'vertical';
  needTitle?: boolean;
}

const SKELETON_INLINE_ROWS = 5;
const SKELETON_VERTICAL_ROWS = 3;

function RecommendSkeleton({ mode }: { mode: 'inline' | 'vertical' }) {
  if (mode === 'inline') {
    return (
      <ul className={style.skeleton} aria-hidden>
        {Array.from({ length: SKELETON_INLINE_ROWS }, (_, i) => (
          <li key={i} className={style.skeletonRow}>
            <span className={style.skeletonBadge} />
            <span className={style.skeletonLine} />
            <span className={style.skeletonViews} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={style.skeletonVertical} aria-hidden>
      {Array.from({ length: SKELETON_VERTICAL_ROWS }, (_, i) => (
        <div key={i} className={style.skeletonCard}>
          <span className={style.skeletonCover} />
          <span className={style.skeletonLine} />
        </div>
      ))}
    </div>
  );
}

export const ArticleRecommend: React.FC<IProps> = ({ mode = 'vertical', articleId = null, needTitle = true }) => {
  const t = useTranslations();
  const requestKey = articleId ?? '';
  const [fetchedKey, setFetchedKey] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<IArticle[]>([]);

  useEffect(() => {
    if (fetchedKey === requestKey) return;
    let cancelled = false;

    ArticleProvider.getRecommend(articleId).then((res) => {
      if (cancelled) return;
      const next = res.slice(0, 6);
      next.sort((a, b) => b.views - a.views);
      setArticles(next);
      setFetchedKey(requestKey);
    });

    return () => {
      cancelled = true;
    };
  }, [articleId, fetchedKey, requestKey]);

  const ready = fetchedKey === requestKey;
  const showSkeleton = !ready && articles.length === 0;
  const showEmpty = ready && articles.length === 0;

  return (
    <div className={cls(style.wrapper, mode === 'inline' && style.inline)}>
      {needTitle && (
        <div className={style.title}>
          <LikeOutlined className={style.recommendIcon} />
          <span>{t('recommendToReading')}</span>
        </div>
      )}

      {showSkeleton ? (
        <RecommendSkeleton mode={mode} />
      ) : showEmpty ? (
        <div className={style.empty}>{t('empty')}</div>
      ) : mode === 'inline' ? (
        <ul className={style.inlineWrapper}>
          {articles.map((article, index) => (
            <li key={article.id}>
              <Link href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                <a className={style.article} title={article.title}>
                  <span className={style.articleTitle} data-num={index + 1}>
                    <span>{article.title}</span>
                  </span>
                  <span className={style.views}>
                    <EyeOutlined />
                    <span className={style.number}>{article.views}</span>
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ArticleList articles={articles} coverHeight={110} asRecommend={true} />
      )}
    </div>
  );
};
