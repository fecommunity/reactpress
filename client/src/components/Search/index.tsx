import { Input, Modal } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ListTrail } from '@/components/Animation/Trail';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { SearchProvider } from '@/providers/search';

import styles from './index.module.scss';

const { Search: AntdSearch } = Input;

interface IProps {
  visible: boolean;
  tags: ITag[];
  onClose: (arg: boolean) => void;
}

export const Search: React.FC<IProps> = ({ visible = true, onClose }) => {
  const ref = useRef(null);
  const t = useTranslations();
  const [searchArticles, loading] = useAsyncLoading(SearchProvider.searchArticles);
  const [articles, setArticles] = useState<IArticle[]>([]);
  const close = useCallback(() => {
    onClose(false);
  }, [onClose]);

  const getArticles = useCallback(
    (keyword) => {
      if (!keyword) {
        setArticles([]);
        return;
      }
      searchArticles(keyword).then((res) => {
        setArticles(res.filter((t) => t.status === 'publish'));
      });
    },
    [searchArticles]
  );

  useEffect(() => {
    if (!visible || !ref.current) {
      return;
    }
    setTimeout(() => {
      // 等待下一次事件循环触发
      ref.current.focus();
    }, 0);
  }, [visible]);

  return (
    <Modal
      title={<span className={styles.title}>{t('searchArticle')}</span>}
      open={visible}
      footer={null}
      animation={false}
      onCancel={close}
      className={styles.inner}
      wrapClassName={styles.searchWrapper}
    >
      <div className={styles.wrapper}>
        <div className={styles.bg}></div>
        <section>
          <AntdSearch
            ref={ref}
            size="large"
            loading={loading}
            placeholder={t('searchArticlePlaceholder') as string}
            onSearch={getArticles}
            style={{ width: '100%' }}
          />
        </section>

        <section className={styles.result}>
          {articles.length ? (
            <ul>
              <ListTrail
                length={articles.length}
                options={{
                  config: { mass: 1, tension: 180, friction: 12, clamp: true },
                  opacity: loading ? 0 : 1,
                  height: loading ? 0 : 48,
                  from: { opacity: 0, height: 0 },
                }}
                renderItem={(index) => {
                  const article = articles[index];
                  return (
                    <Link key={article.id} href={`/article/[id]`} as={`/article/${article.id}`} scroll={false}>
                      <a aria-label={article.title} className={styles.item} onClick={close}>
                        {article.title}
                      </a>
                    </Link>
                  );
                }}
              />
            </ul>
          ) : (
            <p className="empty">{t('empty')}</p>
          )}
        </section>
      </div>
    </Modal>
  );
};
