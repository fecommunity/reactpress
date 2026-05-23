import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Space, Table, Typography } from 'antd';
import { Link, useNavigate } from '@tanstack/react-router';
import { getToolkitClient } from '@/shared/client';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export interface ArticleListSearch {
  page: number;
  pageSize: number;
  status: string;
  keyword: string;
}

interface ArticleListPageProps {
  search: ArticleListSearch;
  routePath: string;
}

export function ArticleListPage({ search, routePath }: ArticleListPageProps) {
  const navigate = useNavigate({ from: routePath as '/' });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', search],
    queryFn: async () => {
      const api = await getToolkitClient();
      const query: Record<string, string | number> = {
        page: search.page,
        pageSize: search.pageSize,
      };
      if (search.status) query.status = search.status;
      if (search.keyword) query.title = search.keyword;
      const res = await api.article.findAll({
        query,
      } as Parameters<typeof api.article.findAll>[0]);
      const tuple = res as unknown as [Record<string, unknown>[], number];
      return { list: tuple[0] ?? [], total: tuple[1] ?? 0 };
    },
    staleTime: 30_000,
  });

  if (isError) {
    return (
      <ModulePlaceholder
        title="文章列表"
        description="无法加载文章数据。请确认 API 已启动且已登录。"
      />
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          文章
        </Typography.Title>
        <Link to="/article/editor">
          <Button type="primary">写文章</Button>
        </Link>
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list ?? []}
        pagination={{
          current: search.page,
          pageSize: search.pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            void navigate({
              search: (prev: ArticleListSearch) => ({ ...prev, page, pageSize }),
            });
          },
        }}
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            ellipsis: true,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: string) => (
              <Badge
                color={status === 'draft' ? 'gold' : 'green'}
                text={status === 'draft' ? '草稿' : '已发布'}
              />
            ),
          },
          {
            title: '操作',
            width: 120,
            render: (_, record) => (
              <Link to="/article/editor/$id" params={{ id: String(record.id) }}>
                编辑
              </Link>
            ),
          },
        ]}
      />
    </Space>
  );
}
