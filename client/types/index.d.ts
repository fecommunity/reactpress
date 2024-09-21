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
  i18n?: string;
  systemUrl?: string; // 系统地址
  systemTitle?: string; // 系统标题
  systemBg?: string; // 全局背景
  systemLogo?: string; // 系统 Logo
  systemFavicon?: string; // 系统 favicon
  systemFooterInfo?: string; // 系统页脚信息
  seoKeyword?: string; // SEO 关键词
  seoDesc?: string; //  SEO 描述
  baiduAnalyticsId?: string; // 百度统计id
  googleAnalyticsId?: string; // 谷歌分析 id
}
