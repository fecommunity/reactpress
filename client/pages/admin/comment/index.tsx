import { Button, message, Popconfirm, Select } from 'antd';
import React, { useCallback, useEffect, useMemo } from 'react';

import { CommentHTML } from '@/components/Comment/CommentAction/CommentHTML';
import { CommentAction } from '@/components/Comment/CommentAction/CommentAction';
import { CommentArticle } from '@/components/Comment/CommentAction/CommentArticle';
import { CommentContent } from '@/components/Comment/CommentAction/CommentContent';
import { CommentStatus } from '@/components/Comment/CommentAction/CommentStatus';
import { LocaleTime } from '@/components/LocaleTime';
import { PaginationTable } from '@/components/PaginationTable';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { usePagination } from '@/hooks/usePagination';
import { AdminLayout } from '@/layout/AdminLayout';
import { CommentProvider } from '@/providers/comment';

let updateLoadingMessage = null;
const SCROLL = { x: 1440 };
const SEARCH_FIELDS = [
  {
    label: '称呼',
    field: 'name',
    msg: '请输入称呼',
  },
  {
    label: 'Email',
    field: 'email',
    msg: '请输入联系方式',
  },
  {
    label: '状态',
    field: 'pass',
    children: (
      <Select style={{ width: 180 }}>
        {[
          { label: '已通过', value: 1 },
          { label: '未通过', value: 0 },
        ].map((t) => {
          return (
            <Select.Option key={t.label} value={t.value as number}>
              {t.label}
            </Select.Option>
          );
        })}
      </Select>
    ),
  },
];
const COMMON_COLUMNS = [
  {
    title: '状态',
    dataIndex: 'pass',
    key: 'pass',
    fixed: 'left',
    width: 100,
    render: (_, record) => <CommentStatus comment={record} />,
  },
  {
    title: '称呼',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '联系方式',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '原始内容',
    dataIndex: 'content',
    key: 'content',
    width: 160,
    render: (_, record) => <CommentContent comment={record} />,
  },
  {
    title: 'HTML 内容',
    dataIndex: 'html',
    key: 'html',
    width: 160,
    render: (_, record) => <CommentHTML comment={record} />,
  },

  {
    title: '管理文章',
    dataIndex: 'url',
    key: 'url',
    width: 100,
    render: (_, record) => {
      return <CommentArticle comment={record} />;
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createAt',
    key: 'createAt',
    width: 200,
    render: (date) => <LocaleTime date={date} />,
  },
];

const Comment = () => {
  const { loading, data: comments, refresh, ...resetPagination } = usePagination<IComment>(CommentProvider.getComments);
  const [updateApi, updateLoading] = useAsyncLoading(CommentProvider.updateComment);
  const [deleteApi, deleteLoading] = useAsyncLoading(CommentProvider.deleteComment);

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

  const parentCommentColumn = useMemo(
    () => ({
      title: '父级评论',
      dataIndex: 'parentCommentId',
      key: 'parentCommentId',
      width: 100,
      render: (id) => {
        const target = comments.find((c) => c.id === id);
        return (target && target.name) || '无';
      },
    }),
    [comments]
  );

  const actionColumn = useCallback(
    (resetSelectedRows) => ({
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <CommentAction
          comment={record}
          refresh={() => {
            resetSelectedRows();
            refresh();
          }}
        />
      ),
    }),
    [refresh]
  );

  useEffect(() => {
    if (updateLoading) {
      updateLoadingMessage = message.loading('操作中...', 0);
    } else {
      updateLoadingMessage && updateLoadingMessage();
    }
  }, [updateLoading]);

  return (
    <AdminLayout>
      <PaginationTable
        showSelection={true}
        loading={loading}
        data={comments}
        columns={(resetSelectedRows) => [...COMMON_COLUMNS, parentCommentColumn, actionColumn(resetSelectedRows)]}
        refresh={refresh}
        {...resetPagination}
        renderLeftNode={({ hasSelected, selectedRowKeys, selectedRows, resetSelectedRows }) =>
          hasSelected ? (
            <>
              <Button
                disabled={!hasSelected}
                style={{ marginRight: 8 }}
                onClick={updateAction(selectedRows, 'pass', true)}
              >
                通过
              </Button>
              <Button
                disabled={!hasSelected}
                style={{ marginRight: 8 }}
                onClick={updateAction(selectedRows, 'status', false)}
              >
                拒绝
              </Button>
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
            </>
          ) : null
        }
        scroll={SCROLL}
        searchFields={SEARCH_FIELDS}
      />
    </AdminLayout>
  );
};

export default Comment;
