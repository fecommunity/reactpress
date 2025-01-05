import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Divider, message, Modal, Popconfirm, Select, Spin } from 'antd';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { LocaleTime } from '@/components/LocaleTime';
import { PaginationTable } from '@/components/PaginationTable';
// import { ViewChart } from '@/components/ViewChart';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { usePagination } from '@/hooks/usePagination';
import { useSetting } from '@/hooks/useSetting';
import { useToggle } from '@/hooks/useToggle';
import { AdminLayout } from '@/layout/AdminLayout';
import { PageProvider } from '@/providers/page';
import { ViewProvider } from '@/providers/view';
import { resolveUrl } from '@/utils';

import style from './index.module.scss';

let updateLoadingMessage = null;

const columns = [
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
  },
  {
    title: '顺序',
    dataIndex: 'order',
    key: 'order',
  },
  {
    title: '阅读量',
    dataIndex: 'views',
    key: 'views',
    render: (views) => (
      <Badge count={views} showZero={true} overflowCount={Infinity} style={{ backgroundColor: '#52c41a' }} />
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const isDraft = status === 'draft';
      return <Badge color={isDraft ? 'gold' : 'green'} text={isDraft ? '草稿' : '已发布'} />;
    },
  },
  {
    title: '发布时间',
    dataIndex: 'publishAt',
    key: 'publishAt',
    render: (date) => <LocaleTime date={date} />,
  },
];
const SEARCH_FIELDS = [
  {
    label: '名称',
    field: 'name',
    msg: '请输入页面名称',
  },
  {
    label: '路径',
    field: 'path',
    msg: '请输入页面路径',
  },
  {
    label: '状态',
    field: 'status',
    children: (
      <Select style={{ width: 180 }}>
        {[
          { label: '已发布', value: 'publish' },
          { label: '草稿', value: 'draft' },
        ].map((t) => {
          return (
            <Select.Option key={t.label} value={t.value}>
              {t.label}
            </Select.Option>
          );
        })}
      </Select>
    ),
  },
];

const Page: NextPage = () => {
  const setting = useSetting();
  const { loading: listLoading, data, refresh, ...resetPagination } = usePagination<IPage>(PageProvider.getPages);
  const [modalVisible, toggleModalVisible] = useToggle(false);
  const [views, setViews] = useState<IView[]>([]);
  const [updateApi, updateLoading] = useAsyncLoading(PageProvider.updatePage);
  const [deleteApi, deleteLoading] = useAsyncLoading(PageProvider.deletePage);
  const [getViewsByUrlApi, getViewsLoading] = useAsyncLoading(ViewProvider.getViewsByUrl);

  const updateAction = useCallback(
    (articles, key, value = null) => {
      if (!Array.isArray(articles)) {
        articles = [articles];
      }
      return () =>
        Promise.all(
          articles.map((article) => updateApi(article.id, { [key]: value !== null ? value : !article[key] }))
        ).then(() => {
          message.success('操作成功');
          refresh();
        });
    },
    [updateApi, refresh]
  );

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

  const getViews = useCallback(
    (url) => {
      toggleModalVisible();
      getViewsByUrlApi(url).then((res) => {
        setViews(res);
      });
    },
    [toggleModalVisible, getViewsByUrlApi]
  );

  const closeViewModal = useCallback(() => {
    toggleModalVisible();
    setViews([]);
  }, [toggleModalVisible]);

  const titleColumn = {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <a href={resolveUrl(setting.systemUrl || '', `/admin/page/${record.path}`)} target="_blank" rel="noreferrer">
        {text}
      </a>
    ),
  };

  const actionColumn = (resetSelectedRows) => ({
    title: '操作',
    key: 'action',
    render: (_, record) => {
      const isDraft = record.status === 'draft';

      return (
        <span className={style.action}>
          <Link href={`/admin/page/editor/[id]`} as={`/admin/page/editor/` + record.id}>
            <a>
              <Button type="link" size={'small'}>
                编辑
              </Button>
            </a>
          </Link>
          <Divider type="vertical" />
          {isDraft ? (
            <Button type="link" size={'small'} onClick={updateAction(record, 'status', 'publish')}>
              发布
            </Button>
          ) : (
            <Button type="link" size={'small'} onClick={updateAction(record, 'status', 'draft')}>
              下线
            </Button>
          )}
          <Divider type="vertical" />
          <Button
            type="link"
            size={'small'}
            onClick={() => getViews(resolveUrl(setting.systemUrl, '/admin/page/' + record.id))}
          >
            查看访问
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="确认删除这个文章？"
            onConfirm={deleteAction(record.id, resetSelectedRows)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ loading: deleteLoading }}
          >
            <Button type="link" size={'small'}>
              删除
            </Button>
          </Popconfirm>
        </span>
      );
    },
  });

  useEffect(() => {
    if (updateLoading) {
      updateLoadingMessage = message.loading('操作中...', 0);
    } else {
      updateLoadingMessage && updateLoadingMessage();
    }
  }, [updateLoading]);

  return (
    <AdminLayout>
      <div className={style.wrapper}>
        <PaginationTable
          showSelection={true}
          loading={listLoading}
          data={data}
          columns={(resetSelectedRows) => [titleColumn, ...columns, actionColumn(resetSelectedRows)]}
          refresh={refresh}
          {...resetPagination}
          renderLeftNode={({ hasSelected, selectedRowKeys, selectedRows, resetSelectedRows }) =>
            hasSelected ? (
              <>
                <Button
                  disabled={!hasSelected}
                  style={{ marginRight: 8 }}
                  onClick={updateAction(selectedRows, 'status', 'publish')}
                >
                  发布
                </Button>
                <Button
                  disabled={!hasSelected}
                  style={{ marginRight: 8 }}
                  onClick={updateAction(selectedRows, 'status', 'draft')}
                >
                  下线
                </Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={deleteAction(selectedRowKeys, resetSelectedRows)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button disabled={!hasSelected} loading={false} danger={true}>
                    删除
                  </Button>
                </Popconfirm>
              </>
            ) : null
          }
          rightNode={
            <Link href={'/admin/page/editor'}>
              <a>
                <Button type="primary">
                  <PlusOutlined />
                  新建
                </Button>
              </a>
            </Link>
          }
          searchFields={SEARCH_FIELDS}
        />
        <Modal
          title="访问统计"
          visible={modalVisible}
          width={640}
          onCancel={closeViewModal}
          maskClosable={false}
          footer={null}
          transitionName={''}
          maskTransitionName={''}
        >
          <div style={{ textAlign: 'center' }}>
            <Spin spinning={getViewsLoading}>
              {/* <ViewChart data={views} /> */}
            </Spin>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Page;
