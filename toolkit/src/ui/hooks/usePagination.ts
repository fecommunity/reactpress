import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useAsyncLoading } from './useAsyncLoading';

export type PaginatedFetch<T> = (
  params: Record<string, unknown> & { page: number; pageSize: number },
) => Promise<[T[], number]>;

export interface UsePaginationOptions<T> {
  page?: number;
  pageSize?: number;
  params?: Record<string, unknown>;
  after?: (snapshot?: {
    loading: boolean;
    page: number;
    pageSize: number;
    data: T[];
    total: number;
  }) => void;
}

export interface UsePaginationResult<T> {
  loading: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  params: Record<string, unknown>;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  setParams: Dispatch<SetStateAction<Record<string, unknown>>>;
  refresh: () => void;
  reset: () => void;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

/**
 * Paginated list state for APIs that return `[items, total]`.
 */
export function usePagination<T>(
  fetch: PaginatedFetch<T>,
  options?: UsePaginationOptions<T>,
): UsePaginationResult<T> {
  const defaultPage = options?.page ?? DEFAULT_PAGE;
  const defaultPageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const defaultParams = options?.params ?? {};
  const after = options?.after;

  const [api, loading] = useAsyncLoading(fetch);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [params, setParams] = useState(defaultParams);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);

  const callAfter = useCallback(() => {
    after?.({ page, pageSize, data, total, loading });
  }, [after, page, pageSize, data, total, loading]);

  const query = useCallback(
    (queryParams: Record<string, unknown> & { page: number; pageSize: number }) =>
      api(queryParams).then((res) => {
        const [items, count] = res as [T[], number];
        setData(items);
        setTotal(count);
        callAfter();
        return res;
      }),
    [api, callAfter],
  );

  const refresh = useCallback(
    () => query({ page, pageSize, ...params }),
    [query, page, pageSize, params],
  );

  const reset = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setParams(defaultParams);
  }, [defaultPage, defaultPageSize, defaultParams]);

  useEffect(() => {
    query({ page, pageSize, ...params });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when page/size/filters change only
  }, [page, pageSize, params]);

  return {
    loading,
    data,
    total,
    page,
    pageSize,
    params,
    setPage,
    setPageSize,
    setParams,
    refresh,
    reset,
  };
}
