declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

interface IUser {
  name: string;
  avatar: string;
  email: string;
  token: string;
  role?: string;
}

interface IFile {
  id: string;
  originalname: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  createAt: string;
}

interface IGlobalConfig {
  navConfig: NavSetting;
}

interface CategoryItem {
  label: string;
  key: string;
  url?: string;
}

interface NavSetting {
  categories: CategoryItem[];
  subCategories: {
    [k: string]: CategoryItem[]
  }
}

interface IArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  html: string;
  cover?: string;
  toc?: string;
  views: number;
  likes: number;
  category: any;
  tags?: [any];
  status: string;
  password?: string; // 访问密码
  needPassword: boolean;
  isRecommended?: boolean;
  isCommentable?: boolean; // 是否可评论
  createAt: string;
  updateAt: string;
  publishAt: string;
}

interface ITag {
  id: string;
  label: string;
  value: string;
  articleCount?: number;
}

interface ICategory {
  id: string;
  label: string;
  value: string;
  articleCount?: number;
}

interface IKnowledge {
  id: string;
  parentId: string;
  order: number;
  title: string;
  cover?: string;
  summary: string;
  content: string;
  html: string;
  toc: string;
  views: number;
  likes: number;
  status: 'draft' | 'publish';
  isCommentable?: boolean;
  createAt: string;
  updateAt: string;
  publishAt: string;
  children?: Array<IKnowledge>;
}

interface IPage {
  id: string;
  name: string;
  path: string;
  cover?: string;
  content: string;
  html: string;
  toc: string;
  status: string;
  views: number;
  createAt: string;
  publishAt: string;
  order?: number;
}

interface IComment {
  id: string;
  name: string;
  email: string;
  avatar: string;
  content: string;
  html: string;
  pass: boolean;
  createAt: string;
  userAgent: string;
  article?: IArticle;
  parentCommentId: string;
  hostId: string;
  url: string;
  replyUserName?: string;
  replyUserEmail?: string;
  children?: [IComment];
}

interface IView {
  id: string;
  ip: string;
  userAgent: string;
  url: string;
  count: number;
  createAt: string;
  updateAt: string;
}

interface IMail {
  id: string;
  from: string;
  to: string;
  subject: number;
  text: string;
  html: string;
  createAt: string;
}

interface ISearch {
  id: string;
  type: string;
  keyword: string;
  count: number;
  createAt: string;
}

interface ISetting {
  i18n?: string; // 国际化
  systemUrl?: string; // 系统地址
  systemTitle?: string; // 系统标题
  systemSubTitle?: string; // 系统副标题
  systemBg?: string; // 全局背景
  systemLogo?: string; // 系统 Logo
  systemFavicon?: string; // 系统 favicon
  systemFooterInfo?: string; // 系统页脚信息
  systemNoticeInfo?: string; // 系统通知信息
  adminSystemUrl?: string; // 后台系统地址

  seoKeyword?: string; // SEO 关键词
  seoDesc?: string; //  SEO 描述

  baiduAnalyticsId?: string; // 百度统计 id
  googleAnalyticsId?: string; // 谷歌分析 id

  ossRegion?: string; // 阿里云 region
  ossAccessKeyId?: string; //  阿里云 accessKeyId
  ossAccessKeySecret?: string; //  阿里云  accessKeySecret
  ossHttps?: boolean; //  阿里云 oss 是否开启 https
  ossBucket?: string; //  阿里云 bucket

  oss?: string; // oss 上传配置

  smtpHost?: string; //   SMTP 地址
  smtpPort?: number; //  SMTP 端口
  smtpUser?: string; //  SMTP 用户
  smtpPass?: string; //  SMTP 授权码
  smtpFromUser?: string; // SMTP 发件人
  globalSetting?: string; // 全局配置
}
