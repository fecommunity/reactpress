import React from 'react';
import {
  PushpinOutlined,
  DashboardOutlined,
  CameraOutlined,
  SnippetsOutlined,
  MessageOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  LineChartOutlined
} from '@ant-design/icons';

export const menus: {
  icon?: any;
  title: string;
  path?: string;
  children?: any[];
  ignore?: boolean;
}[] = [
  {
    icon: <DashboardOutlined />,
    title: '仪表盘',
    path: '/admin',
  },
  {
    icon: <PushpinOutlined />,
    title: '文章',
    children: [
      {
        title: '所有文章',
        path: '/admin/article',
      },
      {
        title: '写文章',
        path: '/admin/article/editor',
      },
      {
        title: '分类目录',
        path: '/admin/article/category',
      },
      {
        title: '标签',
        path: '/admin/article/tags',
      },
    ],
  },
  {
    icon: <CameraOutlined />,
    title: '媒体',
    path: '/admin/file',
  },
  {
    icon: <SnippetsOutlined />,
    title: '页面',
    children: [
      {
        title: '所有页面',
        path: '/admin/page',
      },
      {
        title: '新页面',
        path: '/admin/page/editor',
      },
    ],
  },
  {
    icon: <MessageOutlined />,
    title: '评论',
    path: '/admin/comment',
  },
  {
    title: '专辑',
    path: '/admin/knowledge',
    icon: <BookOutlined />,
  },
  {
    icon: <UserOutlined />,
    title: '用户',
    children: [
      {
        title: '所有用户',
        path: '/admin/user',
      },
      {
        title: '个人资料',
        path: '/admin/ownspace',
      },
    ]
  },
  {
    title: '数据',
    icon: <LineChartOutlined />,
    children: [
      {
        title: '邮件管理',
        path: '/admin/mail',
      },
      {
        title: '搜索记录',
        path: '/admin/search',
      },
      {
        title: '访问统计',
        path: '/admin/view',
      },
    ],
    ignore: true,
  },
  {
    icon: <SettingOutlined />,
    title: '设置',
    children: [
      {
        title: '系统设置',
        path: '/admin/setting?type=系统设置',
      },
      {
        title: 'SEO设置',
        path: '/admin/setting?type=SEO设置',
      },
      {
        title: 'SMTP服务',
        path: '/admin/setting?type=SMTP服务',
      },
      {
        title: 'OSS设置',
        path: '/admin/setting?type=OSS设置',
      },
      {
        title: '国际化设置',
        path: '/admin/setting?type=国际化设置',
      },
      {
        title: '全局设置',
        path: '/admin/setting?type=全局设置',
      },
      {
        title: '数据统计',
        path: '/admin/setting?type=数据统计',
      },
    ]
  },
];

const flattenMenus = menus
  .filter((m) => !m.ignore)
  .reduce((c, menu) => {
    return [...c, menu, ...(menu.children || []).filter((m) => !m.ignore)];
  }, []);

export const findActiveMenu = (pathname) => {
  const idx = flattenMenus.findIndex((menu) => menu.path === pathname || menu.path?.startsWith(pathname));
  if (idx < 0) {
    return [null, []];
  }

  const activeMenu = flattenMenus[idx];
  const breadcrumbs =
    idx > 1
      ? [
          flattenMenus.slice(0, 1)[0],
          ...flattenMenus.slice(1, idx).filter((menu) => {
            return activeMenu.path.includes(menu.path);
          }),
          activeMenu,
        ]
      : [flattenMenus.slice(0, 1)[0]];

  return [activeMenu, breadcrumbs];
};

export const findActiveKeys = (pathname: string) => {
  const [activeMenu] = findActiveMenu(pathname);
  // 找到当前menu的path
  for (let i = 0, len = menus.length; i < len; i++) {
    if (menus[i].title === activeMenu?.title) {
      return [menus[i].title];
    }
    const children = menus?.[i]?.children || [];
    for (let j = 0, childLength = children.length; j < childLength; j++) {
      if (children?.[j]?.title === activeMenu?.title) {
        return [menus[i].title];
      }
    }
  }
  return [activeMenu?.title || ''];
};
