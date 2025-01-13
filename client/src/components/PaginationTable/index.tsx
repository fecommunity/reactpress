import { ReloadOutlined } from '@ant-design/icons';
import { Spin, Table, Tooltip } from 'antd';
import React, { useState } from 'react';

import { Pagination } from '@/components/Pagination';
import { IFieldItem, Search } from '@/components/SearchHeader';
import { ReturnProps } from '@/hooks/usePagination';

import style from './index.module.scss';

interface IProps extends ReturnProps<object> {
  title?: React.ReactNode;
  showSelection?: boolean;
  renderLeftNode?: (arg: {
    hasSelected: boolean;
    selectedRowKeys: string[];
    selectedRows: object[];
    resetSelectedRows: () => void;
  }) => React.ReactNode;
  rightNode?: React.ReactNode;
  padding?: number | string;
  scroll?: { x?: number; y?: number };
  searchFields: Array<IFieldItem>;
  showSearchLabel?: boolean;
  columns?: Array<object> | ((resetSelectedRows) => Array<object>);
  customDataTable?: (data) => React.ReactNode;
}

const rowKey = 'id';

export const PaginationTable: React.FC<IProps> = ({
  loading,
  data,
  total,
  page,
  pageSize,
  setPage,
  setPageSize,
  setParams,
  refresh,
  title,
  showSelection = false,
  renderLeftNode,
  rightNode,
  padding = '24px 12px',
  scroll = null,
  searchFields = [],
  showSearchLabel = true,
  columns = [],
  customDataTable = null,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const hasSelected = selectedRowKeys.length > 0;
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };
  const resetSelectedRows = () => {
    setSelectedRowKeys([]);
  };
  const leftNode =
    renderLeftNode &&
    renderLeftNode({
      hasSelected,
      selectedRowKeys,
      selectedRows: selectedRowKeys.map((id) => data.find((item) => item[rowKey] === id)),
      resetSelectedRows,
    });

  return (
    <div className={style.wrapper}>
      <Search
        fields={searchFields}
        showLabel={showSearchLabel}
        padding={padding}
        onSearch={(params) => {
          setPage(1);
          setParams(params);
        }}
      />
      <div style={{ background: 'var(--bg)', padding }}>
        {customDataTable ? (
          <>
            <div className={style.tableHeader}>
              <div>
                {title}
                {leftNode}
              </div>
              <div>{rightNode}</div>
            </div>
            <Spin spinning={loading}>{customDataTable(data)}</Spin>
          </>
        ) : (
          <>
            <div className={style.tableHeader}>
              <div>
                {title}
                {leftNode}
              </div>
              <div>
                {rightNode}
                <Tooltip title="刷新">
                  <ReloadOutlined onClick={refresh} style={{ marginLeft: 12 }} />
                </Tooltip>
              </div>
            </div>
            <Table
              loading={loading}
              columns={typeof columns === 'function' ? columns(resetSelectedRows) : columns}
              dataSource={data}
              rowKey={rowKey}
              pagination={false}
              {...(scroll ? { scroll } : {})}
              {...(showSelection ? { rowSelection } : {})}
            />
          </>
        )}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </div>
    </div>
  );
};
