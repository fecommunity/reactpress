import { Badge, Button, message, Popconfirm } from 'antd';
import { NextPage } from 'next';
import React, { useCallback } from 'react';

import { LocaleTime } from '@/components/LocaleTime';
import { PaginationTable } from '@/components/PaginationTable';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { usePagination } from '@/hooks/usePagination';
import { AdminLayout } from '@/layout/AdminLayout';
import { ViewProvider } from '@/providers/view';

import style from './index.module.scss';

const SCROLL = { x: 1440 };
const COMMON_COLUMNS = [
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 200,
    fixed: 'left',
    render: (url) => (
      <a className={style.link} href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    ),
  },
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
    width: 160,
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
  },
  {
    title: '内核',
    dataIndex: 'engine',
    key: 'engine',
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
  },
  {
    title: '设备',
    dataIndex: 'device',
    key: 'device',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    render: (address) => {
      return address || '-';
    },
  },
  {
    title: '访问量',
    dataIndex: 'count',
    key: 'count',
    width: 120,
    render: (views) => (
      <Badge count={views} showZero={true} overflowCount={Infinity} style={{ backgroundColor: '#52c41a' }} />
    ),
  },
  {
    title: '访问时间',
    dataIndex: 'createAt',
    key: 'createAt',
    width: 200,
    render: (date) => <LocaleTime date={date} />,
  },
];
const SEARCH_FIELDS = [
  {
    label: 'IP',
    field: 'ip',
    msg: '请输入 IP 地址',
  },
  {
    label: 'UA',
    field: 'userAgent',
    msg: '请输入 User Agent',
  },
  {
    label: 'URL',
    field: 'url',
    msg: '请输入 URL',
  },
  {
    label: '地址',
    field: 'address',
    msg: '请输入地址',
  },
  {
    label: '浏览器',
    field: 'browser',
    msg: '请输入浏览器',
  },
  {
    label: '内核',
    field: 'engine',
    msg: '请输入内核',
  },
  {
    label: 'OS',
    field: 'os',
    msg: '请输入操作系统',
  },
  {
    label: '设备',
    field: 'device',
    msg: '请输入设备',
  },
];

const Views: NextPage = () => {
  const { loading, data, refresh, ...resetPagination } = usePagination<IView>(ViewProvider.getViews);
  const [deleteApi, deleteLoading] = useAsyncLoading(ViewProvider.deleteView);
  const deleteAction = useCallback(
    (ids, resetSelectedRows = null) => {
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      return () => {
        Promise.all(ids.map((id) => deleteApi(id))).then(() => {
          message.success('操作成功');
          resetSelectedRows && resetSelectedRows();
          refresh();
        });
      };
    },
    [deleteApi, refresh]
  );

  const actionColumn = (resetSelectedRows) => ({
    title: '操作',
    key: 'action',
    fixed: 'right',
    render: (_, record) => (
      <span className={style.action}>
        <Popconfirm
          title="确认删除这个访问？"
          onConfirm={deleteAction(record.id, resetSelectedRows)}
          okText="确认"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      </span>
    ),
  });

  return (
    <AdminLayout>
      <div className={style.wrapper}>
        <PaginationTable
          showSelection={true}
          loading={loading}
          data={data}
          columns={(resetSelectedRows) => [...COMMON_COLUMNS, actionColumn(resetSelectedRows)]}
          refresh={refresh}
          {...resetPagination}
          renderLeftNode={({ hasSelected, selectedRowKeys, resetSelectedRows }) =>
            hasSelected ? (
              <Popconfirm
                title="确认删除？"
                onConfirm={deleteAction(selectedRowKeys, resetSelectedRows)}
                okText="确认"
                cancelText="取消"
              >
                <Button disabled={!hasSelected} loading={deleteLoading} danger={true}>
                  删除
                </Button>
              </Popconfirm>
            ) : null
          }
          scroll={SCROLL}
          searchFields={SEARCH_FIELDS}
        />
      </div>
    </AdminLayout>
  );
};

export default Views;
