import React, { useCallback, useEffect, useState } from 'react';

import { useAsyncLoading } from './useAsyncLoading';

type PromiseAction<T> = (...args: unknown[]) => Promise<[Array<T>, number]>;

export interface ReturnProps<T> {
  loading: boolean;
  data: Array<T>;
  total: number;
  page: number;
  pageSize: number;
  params: Record<string, unknown>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  refresh: () => void;
  reset: () => void;
}

interface Options<T> {
  page?: number;
  pageSize?: number;
  params?: Record<string, unknown>;
  after?: (arg?: Pick<ReturnProps<T>, 'loading' | 'page' | 'pageSize' | 'data' | 'total'>) => void;
}

export const usePagination = <T>(fetch: PromiseAction<T>, options?: Options<T>): ReturnProps<T> => {
  const {
    page: defaultPage,
    pageSize: defaultPageSize,
    params: defaultParams,
    after,
  } = {
    page: 1,
    pageSize: 12,
    params: {},
    ...(options || {}),
  };
  const [api, loading] = useAsyncLoading(fetch);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [params, setParams] = useState(defaultParams);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Array<T>>([]);

  const callAfter = useCallback(() => {
    after && after({ page, pageSize, data, total, loading });
  }, [after, page, pageSize, data, total, loading]);

  const query = useCallback(
    (...args) => {
      return api(...args).then((res) => {
        setData(res[0]);
        setTotal(res[1]);
        callAfter();
        return res;
      });
    },
    [api, callAfter]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refresh = useCallback(() => query({ page, pageSize, ...params }), [page, pageSize, params]);

  const reset = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setParams(defaultParams);
  }, [defaultPage, defaultPageSize, defaultParams]);

  useEffect(() => {
    query({ page, pageSize, ...params });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
};
