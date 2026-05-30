import type { ThemeCustomizerGroup, ThemeCustomizerSection } from '../theme';

/** Sidebar nav categories for Twenty Twenty-Five customizer. */
export const TWENTYTWENTYFIVE_CUSTOMIZER_GROUPS: ThemeCustomizerGroup[] = [
  {
    id: 'basic',
    title: '基础配置',
    description: '站点信息与页脚',
  },
  {
    id: 'style',
    title: '样式配置',
    description: '颜色与背景',
  },
  {
    id: 'layout',
    title: '布局配置',
    description: '导航与页面结构',
  },
];

/** Default theme customizer sections for Twenty Twenty-Five (also in `themes/.../theme.json`). */
export const TWENTYTWENTYFIVE_CUSTOMIZER_SECTIONS: ThemeCustomizerSection[] = [
  {
    id: 'identity',
    group: 'basic',
    title: '站点身份',
    settings: [
      {
        id: 'displayTitle',
        type: 'text',
        label: '站点标题',
        description: '留空则继承「设置 → 常规」中的站点标题',
      },
      {
        id: 'displayTagline',
        type: 'text',
        label: '站点副标题',
        description: '留空则继承「设置 → 常规」中的副标题',
      },
      {
        id: 'siteLogo',
        type: 'image',
        label: '站点 Logo',
        description: '留空则继承「设置 → 常规」中的站点 Logo',
      },
      {
        id: 'siteFavicon',
        type: 'image',
        label: '站点图标',
        description: '留空则继承「设置 → 常规」中的站点图标',
      },
      {
        id: 'siteNotice',
        type: 'noticeList',
        label: '站点公告',
        description: '未自定义时继承「设置 → 常规」；可为本主题单独配置多条公告与顺序',
      },
    ],
  },
  {
    id: 'about',
    group: 'basic',
    title: '关于我们与页脚',
    settings: [
      {
        id: 'systemFooterInfo',
        type: 'textarea',
        label: '页脚说明',
        description: '支持 HTML；仅本主题生效',
      },
      {
        id: 'aboutUsGithubUrl',
        type: 'text',
        label: 'GitHub 链接',
        description: '页头与页脚 GitHub 图标；留空不显示',
      },
      {
        id: 'aboutUsCommentQr',
        type: 'image',
        label: '社群/评论二维码',
        description: '悬停展示的图片地址',
      },
      {
        id: 'aboutUsWechatQr',
        type: 'image',
        label: '微信二维码',
        description: '悬停展示的图片地址',
      },
    ],
  },
  {
    id: 'colors',
    group: 'style',
    title: '颜色',
    description: '与访客站顶栏「日 / 夜」切换对应，可分别配置浅色与深色模式',
    settingGroups: [
      {
        id: 'light',
        title: '浅色模式',
        description: '访客关闭深色模式时生效',
      },
      {
        id: 'dark',
        title: '深色模式',
        description: '访客开启深色模式时生效',
      },
    ],
    settings: [
      { id: 'primaryColor', settingGroup: 'light', type: 'color', label: '主色', default: '#f44336' },
      {
        id: 'backgroundColor',
        settingGroup: 'light',
        type: 'color',
        label: '背景色',
        default: '#ffffff',
        description: '页面与内容区背景；设置背景图后主区域会透明以露出图片',
      },
      {
        id: 'secondaryBackgroundColor',
        settingGroup: 'light',
        type: 'color',
        label: '次要背景色',
        default: '#f3f5f7',
        description: '卡片间隔、侧栏等次要区域',
      },
      {
        id: 'linkColor',
        settingGroup: 'light',
        type: 'color',
        label: '链接色',
        default: '#4299e1',
        description: '正文 Markdown 中的链接颜色',
      },
      {
        id: 'darkPrimaryColor',
        settingGroup: 'dark',
        type: 'color',
        label: '主色',
        default: '#f44336',
      },
      {
        id: 'darkBackgroundColor',
        settingGroup: 'dark',
        type: 'color',
        label: '背景色',
        default: '#1e2a36',
        description: '页面与主内容区背景',
      },
      {
        id: 'darkSecondaryBackgroundColor',
        settingGroup: 'dark',
        type: 'color',
        label: '次要背景色',
        default: '#1a242f',
        description: '卡片、顶栏、侧栏等次要区域',
      },
      {
        id: 'darkLinkColor',
        settingGroup: 'dark',
        type: 'color',
        label: '链接色',
        default: '#4299e1',
        description: '正文 Markdown 中的链接颜色',
      },
    ],
  },
  {
    id: 'background',
    group: 'style',
    title: '背景图片',
    settings: [
      {
        id: 'backgroundImage',
        type: 'image',
        label: '背景图',
        description: '设置后将覆盖纯色背景（宽屏可见）；仅本主题生效',
      },
    ],
  },
  {
    id: 'themeConfiguration',
    group: 'layout',
    title: '顶栏与网址导航',
    panel: 'configuration',
    description: '固定导航、/nav 卡片与聚合搜索',
  },
];

/** Full `theme.json` → `customizer` block for Twenty Twenty-Five. */
export const TWENTYTWENTYFIVE_CUSTOMIZER: {
  groups: ThemeCustomizerGroup[];
  sections: ThemeCustomizerSection[];
} = {
  groups: TWENTYTWENTYFIVE_CUSTOMIZER_GROUPS,
  sections: TWENTYTWENTYFIVE_CUSTOMIZER_SECTIONS,
};
