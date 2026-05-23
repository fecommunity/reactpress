import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const commentModule: AdminModule = {
  id: 'comment',
  register({ permissions, routes }) {
    permissions.register(['comment:manage']);
    routes.registerRoute({ path: '/article/comment', permission: 'comment:manage' });
  },
};
