import type { AdminModule } from '@fecommunity/reactpress-toolkit/admin';

export const articleModule: AdminModule = {
  id: 'article',
  register({ menu, permissions, routes }) {
    permissions.register(['article:read', 'article:write', 'article:publish']);
    menu.register({
      id: 'content',
      title: '内容',
      sort: 10,
      children: [
        {
          id: 'article.list',
          title: '文章',
          path: '/article',
          icon: 'IconLucideBookOpen',
          permissions: ['article:read'],
          sort: 0,
        },
        {
          id: 'article.new',
          title: '写文章',
          path: '/article/editor',
          icon: 'IconLucideSparkles',
          permissions: ['article:write'],
          sort: 1,
        },
        {
          id: 'article.comment',
          title: '评论',
          path: '/article/comment',
          icon: 'IconLucideHistory',
          permissions: ['comment:manage'],
          sort: 2,
        },
      ],
    });
    routes.registerRoute({ path: '/article', permission: 'article:read' });
    routes.registerRoute({ path: '/article/editor', permission: 'article:write' });
  },
};
