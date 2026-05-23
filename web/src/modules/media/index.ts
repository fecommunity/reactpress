import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const mediaModule: AdminModule = {
  id: 'media',
  register({ menu, permissions, routes }) {
    permissions.register(['media:manage']);
    menu.register({
      id: 'media.library',
      title: '媒体库',
      path: '/media',
      icon: 'IconLucideFolderKanban',
      permissions: ['media:manage'],
      sort: 20,
    });
    routes.registerRoute({ path: '/media', permission: 'media:manage' });
  },
};
