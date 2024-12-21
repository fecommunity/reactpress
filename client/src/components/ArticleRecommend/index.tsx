import { ArticleList } from '@components/ArticleList';
import { Spin } from 'antd';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { ArticleProvider } from '@/providers/article';
import { LikeOutlined, EyeOutlined } from '@ant-design/icons';

import style from './index.module.scss';

interface IProps {
  articleId?: string;
  mode?: 'inline' | 'vertical';
  needTitle?: boolean;
}

export const ArticleRecommend: React.FC<IProps> = ({ mode = 'vertical', articleId = null, needTitle = true }) => {
  const t = useTranslations();
  const [getRecommend, loading] = useAsyncLoading(ArticleProvider.getRecommend, 150, true);
  const [fetched, setFetched] = useState('');
  const [articles, setArticles] = useState<IArticle[]>([]);

  useEffect(() => {
    if (fetched === articleId) return;
    getRecommend(articleId).then((res) => {
      const articles = res.slice(0, 6);
      articles.sort((a, b) => b.views - a.views);
      setArticles(articles);
      setFetched(articleId);
    });
  }, [articleId, getRecommend, fetched]);

  return (
    <div className={cls(style.wrapper, mode === 'inline' && style.inline)}>
      {needTitle && (
        <div className={style.title}>
          <LikeOutlined className={style.recommendIcon} />
          <span>{t('recommendToReading')}</span>
        </div>
      )}

      <Spin spinning={loading}>
        {loading ? (
          <div style={{ height: 150, backgroundColor: 'var(--bg-second)' }}></div>
        ) : mode === 'inline' ? (
          articles.length <= 0 ? (
            loading ? (
              <div style={{ height: 32 }}></div>
            ) : (
              <div className={'empty'}>{t('empty')}</div>
            )
          ) : (
            <ul className={style.inlineWrapper}>
              {articles.map((article, index) => {
                return (
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
                );
              })}
            </ul>
          )
        ) : (
          <ArticleList articles={articles || []} coverHeight={110} asRecommend={true} />
        )}
      </Spin>
    </div>
  );
};
