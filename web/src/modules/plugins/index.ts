import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const pluginsModule: AdminModule = {
  id: 'plugins',
  register({ menu, permissions, routes }) {
    permissions.register(['extension:manage']);
    menu.register({
      id: 'plugins',
      title: '插件',
      path: '/plugins',
      icon: 'IconLucidePuzzle',
      permissions: ['extension:manage'],
      sort: 40,
    });
    routes.registerRoute({ path: '/plugins', permission: 'extension:manage' });
  },
};
