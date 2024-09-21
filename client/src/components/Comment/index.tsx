import { Button, Pagination } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';

import { usePagination } from '@/hooks/usePagination';
import { useToggle } from '@/hooks/useToggle';
import { CommentProvider } from '@/providers/comment';

import { CommentEditor } from './CommentEditor';
import { Comments } from './CommentItem';
import styles from './index.module.scss';

interface IProps {
  hostId: string;
}

export const COMMENT_DOM_ID = `js-comment-id`;

export const Comment: React.FC<IProps> = ({ hostId: articleId }) => {
  const ref = useRef(null);
  const t = useTranslations();
  const [firstLoad, setFirstLoad] = useToggle(true);
  const {
    data: comments,
    total,
    loading,
    page,
    pageSize,
    setPage,
  } = usePagination<IComment>((params) => CommentProvider.getArticleComments(articleId, params), {
    pageSize: 6,
    after: ({ page }) => {
      if (page === 1 && firstLoad) {
        setFirstLoad(false);
        return;
      }
      Promise.resolve().then(() => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
      });
    },
  });

  return (
    <div id={COMMENT_DOM_ID} ref={ref}>
      <div className={styles.editorWrapper}>
        <CommentEditor hostId={articleId} parentComment={null} replyComment={null} />
      </div>
      <Comments comments={comments} />
      <div className={styles.pagination} style={{ padding: loading || total > pageSize ? '16px 0' : '16px 0 0' }}>
        {!loading && total > 0 ? (
          <Pagination
            size="small"
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            hideOnSinglePage={true}
          />
        ) : loading ? (
          <Button type="primary" loading={true}>
            {t('loading')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
