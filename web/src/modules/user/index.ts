import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const userModule: AdminModule = {
  id: 'user',
  register({ menu, permissions, routes }) {
    permissions.register(['user:manage']);
    menu.register({
      id: 'users',
      title: '用户',
      sort: 40,
      children: [
        {
          id: 'users.list',
          title: '用户管理',
          path: '/users',
          icon: 'IconLucideUsers',
          permissions: ['user:manage'],
          sort: 0,
        },
        {
          id: 'users.profile',
          title: '个人资料',
          path: '/profile',
          icon: 'IconLucideUserList',
          sort: 1,
        },
      ],
    });
    routes.registerRoute({ path: '/users', permission: 'user:manage' });
    routes.registerRoute({ path: '/profile', permission: null });
  },
};
