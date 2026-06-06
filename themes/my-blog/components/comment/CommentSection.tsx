'use client';

import CommentEditor from '@/components/comment/CommentEditor';
import { CommentList } from '@/components/comment/CommentItem';
import { CommentProvider } from '@/lib/providers/client';
import { COMMENT_DOM_ID, type CommentNode } from '@/lib/utils/comment';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { usePagination, useToggle } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CommentSectionProps {
  hostId: string;
}

export default function CommentSection({ hostId }: CommentSectionProps) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [firstLoad, setFirstLoad] = useToggle(true);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  const {
    data: comments,
    total,
    loading,
    page,
    pageSize,
    setPage,
    refresh,
  } = usePagination<CommentNode>(
    (params) => CommentProvider.getArticleComments(hostId, params),
    {
      pageSize: 6,
      after: ({ page: currentPage }) => {
        if (currentPage === 1 && firstLoad) {
          setFirstLoad(false);
          return;
        }
        Promise.resolve().then(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth' });
        });
      },
    },
  );

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    refresh();
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 2000);
  }, [refresh]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div id={COMMENT_DOM_ID} ref={ref} className="rp-comment-root">
      <div className="rp-comment-editor-wrap">
        <CommentEditor
          hostId={hostId}
          onSuccess={showToast}
        />
      </div>

      <CommentList comments={comments} onSuccess={showToast} />

      <div className="rp-comment-pagination">
        {!loading && total > pageSize ? (
          <div className="rp-comment-pagination-inner">
            <button
              type="button"
              className="rp-comment-pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`rp-comment-pagination-btn${pageNumber === page ? ' is-active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="rp-comment-pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        ) : loading ? (
          <button type="button" className="rp-comment-btn rp-comment-btn-primary" disabled>
            {t('loading')}
          </button>
        ) : null}
      </div>

      {toast ? (
        <div className="rp-comment-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
