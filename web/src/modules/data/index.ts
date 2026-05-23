import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const dataModule: AdminModule = {
  id: 'data',
  register({ menu, permissions, routes }) {
    permissions.register(['view:read']);
    menu.register({
      id: 'data',
      title: '数据',
      sort: 60,
      children: [
        {
          id: 'data.analytics',
          title: '统计',
          path: '/data/analytics',
          permissions: ['view:read'],
          sort: 0,
        },
        {
          id: 'data.export',
          title: '导出',
          path: '/data/export',
          permissions: ['setting:manage'],
          sort: 1,
        },
        {
          id: 'data.import',
          title: '导入',
          path: '/data/import',
          permissions: ['setting:manage'],
          sort: 2,
        },
      ],
    });
    routes.registerRoute({ path: '/data/analytics', permission: 'view:read' });
    routes.registerRoute({ path: '/data/export', permission: 'setting:manage' });
    routes.registerRoute({ path: '/data/import', permission: 'setting:manage' });
  },
};
