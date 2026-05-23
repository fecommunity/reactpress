import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Typography, theme, Flex, Skeleton, List } from "antd";
import { FileText, MessageSquare, Files, LayoutTemplate } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";
import { RecentCommentsCard } from "@/modules/dashboard/components/RecentCommentsCard";
import { dashboardThemeVars } from "@/modules/dashboard/dashboardThemeVars";
import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import "@/routes/_auth/dashboard/index.css";

const { Title, Text } = Typography;

async function fetchDashboardStats() {
  const api = await getToolkitClient();
  const [articles, pages, comments, files] = await Promise.all([
    api.article.findAll({ query: { page: 1, pageSize: 1 } } as Parameters<
      typeof api.article.findAll
    >[0]),
    api.page.findAll({ query: { page: 1, pageSize: 1 } } as Parameters<typeof api.page.findAll>[0]),
    api.comment.findAll({ query: { page: 1, pageSize: 1 } } as Parameters<
      typeof api.comment.findAll
    >[0]),
    api.file.findAll({ query: { page: 1, pageSize: 1 } } as Parameters<typeof api.file.findAll>[0]),
  ]);
  return {
    articles: parsePaginated(articles).total,
    pages: parsePaginated(pages).total,
    comments: parsePaginated(comments).total,
    files: parsePaginated(files).total,
  };
}

async function fetchRecentArticles() {
  const api = await getToolkitClient();
  const res = await api.article.findAll({
    query: { page: 1, pageSize: 5, status: "publish" },
  } as Parameters<typeof api.article.findAll>[0]);
  return parsePaginated<{ id: string; title: string; views?: number }>(res).list;
}

export function DashboardPage() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const dashThemeStyle = useMemo(
    () => ({ ...dashboardThemeVars(token), ...articleListThemeVars(token) }),
    [token],
  );

  const { data: stats, isPending: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });

  const { data: recentArticles, isPending: articlesLoading } = useQuery({
    queryKey: ["dashboard-recent-articles"],
    queryFn: fetchRecentArticles,
    staleTime: 60_000,
  });

  const statCards = [
    {
      title: t("dashboard.statArticles"),
      value: stats?.articles ?? 0,
      icon: <FileText size={20} color={token.colorTextSecondary} />,
      to: "/article" as const,
    },
    {
      title: t("dashboard.statPages"),
      value: stats?.pages ?? 0,
      icon: <LayoutTemplate size={20} color={token.colorTextSecondary} />,
      to: "/page" as const,
    },
    {
      title: t("dashboard.statComments"),
      value: stats?.comments ?? 0,
      icon: <MessageSquare size={20} color={token.colorTextSecondary} />,
      to: "/article/comment" as const,
    },
    {
      title: t("dashboard.statFiles"),
      value: stats?.files ?? 0,
      icon: <Files size={20} color={token.colorTextSecondary} />,
      to: "/media" as const,
    },
  ];

  return (
    <Flex vertical gap={token.marginLG} style={dashThemeStyle}>
      <div className="admin-page-header">
        <Title level={2} className="admin-page-title" style={{ margin: 0 }}>
          {t("dashboard.title")}
        </Title>
      </div>
      <Row gutter={[16, 16]}>
        {statCards.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Link to={stat.to} className="dash-stat-link">
              <Card
                className="dash-card-interactive admin-panel"
                styles={{ body: { padding: token.paddingLG } }}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: token.marginXS }}
                >
                  <Text strong style={{ fontSize: token.fontSizeSM }}>
                    {stat.title}
                  </Text>
                  {stat.icon}
                </Flex>
                {statsLoading ? (
                  <Skeleton.Input active style={{ width: 60, height: 28 }} />
                ) : (
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>{stat.value}</div>
                )}
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="admin-panel"
            title={
              <Title level={5} style={{ margin: 0 }}>
                {t("dashboard.recentArticles")}
              </Title>
            }
          >
            {articlesLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <List
                dataSource={recentArticles ?? []}
                locale={{ emptyText: t("common.noData") }}
                renderItem={(item) => (
                  <List.Item className="dash-recent-row">
                    <Link to="/article/editor/$id" params={{ id: item.id }}>
                      {item.title}
                    </Link>
                    <Text type="secondary">{item.views ?? 0}</Text>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="admin-panel"
            title={
              <Title level={5} style={{ margin: 0 }}>
                {t("dashboard.quickLinks")}
              </Title>
            }
          >
            <List
              dataSource={[
                { label: t("menu.article.new"), to: "/article/editor" },
                { label: t("menu.page.new"), to: "/page/editor" },
                { label: t("settings.title"), to: "/settings/general" },
                { label: t("placeholder.media"), to: "/media" },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Link to={item.to}>{item.label}</Link>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <RecentCommentsCard />
        </Col>
      </Row>
    </Flex>
  );
}
