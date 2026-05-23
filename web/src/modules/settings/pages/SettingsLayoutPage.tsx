import { Card, Tabs, Typography } from 'antd';
import { Link, useRouterState } from '@tanstack/react-router';
import { getSettingsTabs } from '@/shell/bootstrap';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

const TAB_LABELS: Record<string, string> = {
  general: '站点常规、时区与基础信息',
  reading: '首页展示、RSS 与阅读偏好',
  discussion: '评论审核与讨论规则',
  email: 'SMTP 与发信配置',
  storage: '本地存储与 OSS',
  seo: '站点 SEO 与元信息',
  'api-keys': 'REST API 密钥',
  webhooks: '事件回调地址',
};

interface SettingsLayoutPageProps {
  tab: string;
}

export function SettingsLayoutPage({ tab }: SettingsLayoutPageProps) {
  const tabs = getSettingsTabs();
  const routerState = useRouterState();
  const activeKey = tab || 'general';

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        设置
      </Typography.Title>
      <Tabs
        activeKey={activeKey}
        items={tabs.map((t) => ({
          key: t.id,
          label: <Link to={t.path}>{t.title}</Link>,
        }))}
      />
      <ModulePlaceholder
        title={tabs.find((t) => t.id === activeKey)?.title ?? '设置'}
        description={TAB_LABELS[activeKey] ?? routerState.location.pathname}
      />
    </Card>
  );
}
