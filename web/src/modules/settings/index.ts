import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

const SETTING_TABS = [
  { id: 'general', title: '常规', path: '/settings/general', sort: 0 },
  { id: 'reading', title: '阅读', path: '/settings/reading', sort: 1 },
  { id: 'discussion', title: '讨论', path: '/settings/discussion', sort: 2 },
  { id: 'email', title: '邮件', path: '/settings/email', sort: 3 },
  { id: 'storage', title: '存储', path: '/settings/storage', sort: 4 },
  { id: 'seo', title: 'SEO', path: '/settings/seo', sort: 5 },
  { id: 'api-keys', title: 'API 密钥', path: '/settings/api-keys', sort: 6 },
  { id: 'webhooks', title: 'Webhooks', path: '/settings/webhooks', sort: 7 },
] as const;

export const settingsModule: AdminModule = {
  id: 'settings',
  register({ menu, settings, permissions, routes }) {
    permissions.register(['setting:manage']);
    menu.register({
      id: 'settings',
      title: '设置',
      path: '/settings/general',
      icon: 'IconLucideSettings',
      permissions: ['setting:manage'],
      sort: 60,
      children: SETTING_TABS.map((tab) => ({
        id: `settings.${tab.id}`,
        title: tab.title,
        path: tab.path,
        permissions: ['setting:manage'] as const,
        sort: tab.sort,
      })),
    });
    for (const tab of SETTING_TABS) {
      settings.registerTab({
        id: tab.id,
        title: tab.title,
        path: tab.path,
        permission: 'setting:manage',
        sort: tab.sort,
      });
      routes.registerRoute({ path: tab.path, permission: 'setting:manage' });
    }
  },
};
