import { Pagination as APagination } from 'antd';
import React, { useCallback, useState } from 'react';

import style from './index.module.scss';

interface IProps {
  total: number;
  defaultPageSize?: number;
  page: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  hideOnSinglePage?: boolean;
}

export const usePagination = ({
  page: defaultPage = 1,
  pageSize: defaultPageSize = 12,
}): [{ page: number; pageSize: number }, (arg, arg1) => void] => {
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const updatePagination = useCallback((page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  return [{ page, pageSize }, updatePagination];
};

export const Pagination: React.FC<IProps> = ({ total, onChange, page, pageSize, hideOnSinglePage = false }) => {
  return (
    <div className={style.wrapper}>
      {total > 0 ? (
        <APagination
          pageSizeOptions={['8', '12', '24', '36']}
          showSizeChanger={true}
          showTotal={(total) => `共${total}条`}
          total={total}
          current={page}
          pageSize={pageSize}
          hideOnSinglePage={hideOnSinglePage}
          onChange={(page, pageSize) => {
            onChange(page, pageSize);
          }}
          onShowSizeChange={(page, pageSize) => {
            onChange(page, pageSize);
          }}
        />
      ) : null}
    </div>
  );
};
