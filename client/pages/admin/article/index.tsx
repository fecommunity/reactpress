import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Divider, message, Modal, Popconfirm, Select, Spin, Tag } from 'antd';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { LocaleTime } from '@/components/LocaleTime';
import { PaginationTable } from '@/components/PaginationTable';
import { ViewChart } from '@/components/ViewChart';
import { getRandomColor } from '@/utils';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { usePagination } from '@/hooks/usePagination';
import { useSetting } from '@/hooks/useSetting';
import { useToggle } from '@/hooks/useToggle';
import { AdminLayout } from '@/layout/AdminLayout';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';
import { ViewProvider } from '@/providers/view';
import { resolveUrl } from '@/utils';

import style from './index.module.scss';

let updateLoadingMessage = null;
const SCROLL = { x: 1380 };
const SEARCH_FIELDS = [
  {
    label: '标题',
    field: 'title',
    msg: '请输入文章标题',
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
const COMMON_COLUMNS = [
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    key: 'status',
    render: (status) => {
      const isDraft = status === 'draft';
      return <Badge color={isDraft ? 'gold' : 'green'} text={isDraft ? '草稿' : '已发布'} />;
    },
  },
  {
    title: '分类',
    key: 'category',
    dataIndex: 'category',
    width: 100,
    render: (category) =>
      category ? (
        <span>
          <Tag color={getRandomColor(category.label)} key={category.value}>
            {category.label}
          </Tag>
        </span>
      ) : null,
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: 'tags',
    width: 200,
    render: (tags) => (
      <span>
        {tags.map((tag) => {
          return (
            <Tag color={getRandomColor(tag.label)} key={tag.label}>
              {tag.label}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: '阅读量',
    dataIndex: 'views',
    key: 'views',
    width: 120,
    render: (views) => (
      <Badge count={views} showZero={true} overflowCount={Infinity} style={{ backgroundColor: '#52c41a' }} />
    ),
  },
  {
    title: '喜欢数',
    dataIndex: 'likes',
    key: 'likes',
    width: 120,
    render: (val) => (
      <Badge count={val} showZero={true} overflowCount={Infinity} style={{ backgroundColor: '#eb2f96' }} />
    ),
  },
  {
    title: '发布时间',
    dataIndex: 'publishAt',
    key: 'publishAt',
    width: 200,
    render: (date) => <LocaleTime date={date} />,
  },
];

const Article: NextPage = () => {
  const setting = useSetting();
  const [modalVisible, toggleModalVisible] = useToggle(false);
  const [views, setViews] = useState<IView[]>([]);
  const [categorys, setCategorys] = useState<Array<ICategory>>([]);
  const {
    loading: listLoading,
    data: articles,
    refresh,
    ...resetPagination
  } = usePagination<IArticle>(ArticleProvider.getArticles);
  const [updateApi, updateLoading] = useAsyncLoading(ArticleProvider.updateArticle);
  const [deleteAPi, deleteLoading] = useAsyncLoading(ArticleProvider.deleteArticle);
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
        Promise.all(ids.map((id) => deleteAPi(id))).then(() => {
          message.success('操作成功');
          refresh();
          resetSelectedRows && resetSelectedRows();
        });
      };
    },
    [deleteAPi, refresh]
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
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    fixed: 'left',
    width: 200,
    render: (text, record) => (
      <a href={resolveUrl(setting.systemUrl, `/article/${record.id}`)} target="_blank" rel="noreferrer">
        {text}
      </a>
    ),
  };

  const actionColumn = (resetSelectedRows) => ({
    title: '操作',
    key: 'action',
    fixed: 'right',
    render: (_, record: IArticle) => (
      <span className={style.action}>
        <Link href={`/admin/article/editor/[id]`} as={`/admin/article/editor/` + record.id}>
          <a>
            <Button type="link" size={'small'}>
              编辑
            </Button>
          </a>
        </Link>
        <Divider type="vertical" />
        <Button type="link" size={'small'} onClick={updateAction(record, 'isRecommended')}>
          {record.isRecommended ? '撤销首焦' : '首焦推荐'}
        </Button>
        <Divider type="vertical" />
        <Button
          type="link"
          size={'small'}
          onClick={() => getViews(resolveUrl(setting.systemUrl, '/article/' + record.id))}
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
    ),
  });

  useEffect(() => {
    CategoryProvider.getCategory().then((res) => setCategorys(res));
  }, []);

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
          data={articles}
          columns={(resetSelectedRows) => [titleColumn, ...COMMON_COLUMNS, actionColumn(resetSelectedRows)]}
          {...resetPagination}
          refresh={refresh}
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
                  草稿
                </Button>
                <Button
                  disabled={!hasSelected}
                  style={{ marginRight: 8 }}
                  onClick={updateAction(selectedRows, 'isRecommended', true)}
                >
                  首焦推荐
                </Button>
                <Button
                  disabled={!hasSelected}
                  style={{ marginRight: 8 }}
                  onClick={updateAction(selectedRows, 'isRecommended', false)}
                >
                  撤销首焦
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
          rightNode={
            <Link href={'/admin/article/editor'}>
              <a>
                <Button type="primary">
                  <PlusOutlined />
                  新建
                </Button>
              </a>
            </Link>
          }
          scroll={SCROLL}
          searchFields={[
            ...SEARCH_FIELDS,
            {
              label: '分类',
              field: 'category',
              children: (
                <Select style={{ width: 180 }}>
                  {categorys.map((t) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.label}
                    </Select.Option>
                  ))}
                </Select>
              ),
            },
          ]}
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
              <ViewChart data={views} />
            </Spin>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Article;
