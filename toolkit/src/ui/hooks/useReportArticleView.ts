import { useEffect, useState } from 'react';

import { themeApi } from '../../theme/api';
import { unpackOne } from '../../theme/api-data';

/**
 * Report article view on mount and return the latest view count for display.
 */
export function useReportArticleView(
  articleId: string | undefined,
  initialViews?: number,
): number | undefined {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    setViews(initialViews);
  }, [articleId, initialViews]);

  useEffect(() => {
    if (!articleId) return undefined;

    let cancelled = false;
    themeApi.article
      .updateViewsById(articleId)
      .then((res) => {
        if (cancelled) return;
        const updated = unpackOne<{ views?: number }>(res);
        if (typeof updated?.views === 'number') {
          setViews(updated.views);
        } else {
          setViews((prev) => (typeof prev === 'number' ? prev + 1 : 1));
        }
      })
      .catch((error) => {
        console.error('[reactpress] report article view failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return views;
}
