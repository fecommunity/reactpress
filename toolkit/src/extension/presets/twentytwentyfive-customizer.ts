import type { ThemeCustomizerSection } from '../theme';

/** Default theme customizer sections for Twenty Twenty-Five (also in `themes/.../theme.json`). */
export const TWENTYTWENTYFIVE_CUSTOMIZER_SECTIONS: ThemeCustomizerSection[] = [
  {
    id: 'identity',
    title: '站点身份',
    settings: [
      {
        id: 'siteLogo',
        type: 'image',
        label: '站点 Logo',
        description: '留空则使用后台「站点 Logo」(systemLogo)',
      },
      {
        id: 'displayTitle',
        type: 'text',
        label: '站点标题',
        description: '留空则使用后台「站点标题」(systemTitle)',
      },
      {
        id: 'displayTagline',
        type: 'text',
        label: '站点副标题',
        description: '留空则使用后台「站点副标题」(systemSubTitle)',
      },
    ],
  },
  {
    id: 'colors',
    title: '颜色',
    settings: [
      { id: 'primaryColor', type: 'color', label: '主色', default: '#f44336' },
      { id: 'backgroundColor', type: 'color', label: '背景色', default: '#ffffff' },
    ],
  },
  {
    id: 'background',
    title: '背景图片',
    settings: [
      {
        id: 'backgroundImage',
        type: 'image',
        label: '背景图',
        description: '设置后将覆盖纯色背景（宽屏可见）',
      },
    ],
  },
  {
    id: 'about',
    title: '关于我们与页脚',
    settings: [
      {
        id: 'systemFooterInfo',
        type: 'textarea',
        label: '页脚说明',
        description: '支持 HTML；同步保存到站点设置',
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
    id: 'themeConfiguration',
    title: '顶栏与网址导航',
    panel: 'configuration',
    description: '固定导航、/nav 卡片与聚合搜索',
  },
];
