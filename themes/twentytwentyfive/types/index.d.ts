/**
 * SCSS模块声明，用于导入SCSS文件时获得类型支持
 */
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

/**
 * 用户信息接口
 */
interface IUser {
  /** 用户名 */
  name: string;
  /** 用户头像URL */
  avatar: string;
  /** 用户邮箱 */
  email: string;
  /** 认证token */
  token: string;
  /** 用户角色(可选) */
  role?: string;
}

/**
 * 文件信息接口
 */
interface IFile {
  /** 文件ID */
  id: string;
  /** 原始文件名 */
  originalname: string;
  /** 存储文件名 */
  filename: string;
  /** 文件MIME类型 */
  type: string;
  /** 文件大小(字节) */
  size: number;
  /** 文件访问URL */
  url: string;
  /** 创建时间 */
  createAt: string;
}

/**
 * 全局配置接口
 */
interface IGlobalConfig {
  /** 导航设置 */
  navConfig: NavSetting;
  /** URL配置数组 */
  urlConfig: any[];
}

/**
 * 分类项接口
 */
interface CategoryItem {
  /** 显示标签 */
  label: string;
  /** 唯一键 */
  key: string;
  /** 链接URL(可选) */
  url?: string;
}

/**
 * 导航设置接口
 */
interface NavSetting {
  /** 主分类列表 */
  categories: CategoryItem[];
  /** 子分类映射表，key为主分类key */
  subCategories: {
    [k: string]: CategoryItem[];
  };
}

/**
 * 文章信息接口
 */
interface IArticle {
  /** 文章ID */
  id: string;
  /** 文章标题 */
  title: string;
  /** 文章摘要 */
  summary: string;
  /** 文章原始内容 */
  content: string;
  /** 文章HTML内容 */
  html: string;
  /** 封面图URL(可选) */
  cover?: string;
  /** 目录HTML(可选) */
  toc?: string;
  /** 浏览次数 */
  views: number;
  /** 点赞次数 */
  likes: number;
  /** 所属分类 */
  category: any;
  /** 标签数组(可选) */
  tags?: [any];
  /** 文章状态 */
  status: string;
  /** 访问密码(可选) */
  password?: string;
  /** 是否需要密码 */
  needPassword: boolean;
  /** 是否推荐(可选) */
  isRecommended?: boolean;
  /** 是否可评论(可选) */
  isCommentable?: boolean;
  /** 创建时间 */
  createAt: string;
  /** 更新时间 */
  updateAt: string;
  /** 发布时间 */
  publishAt: string;
}

/**
 * 标签信息接口
 */
interface ITag {
  /** 标签ID */
  id: string;
  /** 标签显示名称 */
  label: string;
  /** 标签值 */
  value: string;
  /** 关联文章数(可选) */
  articleCount?: number;
}

/**
 * 分类信息接口
 */
interface ICategory {
  /** 分类ID */
  id: string;
  /** 分类显示名称 */
  label: string;
  /** 分类值 */
  value: string;
  /** 关联文章数(可选) */
  articleCount?: number;
}

/**
 * 知识库节点接口
 */
interface IKnowledge {
  /** 节点ID */
  id: string;
  /** 父节点ID */
  parentId: string;
  /** 排序序号 */
  order: number;
  /** 节点标题 */
  title: string;
  /** 封面图URL(可选) */
  cover?: string;
  /** 摘要 */
  summary: string;
  /** 原始内容 */
  content: string;
  /** HTML内容 */
  html: string;
  /** 目录HTML */
  toc: string;
  /** 浏览次数 */
  views: number;
  /** 点赞次数 */
  likes: number;
  /** 状态: draft-草稿 | publish-已发布 */
  status: 'draft' | 'publish';
  /** 是否可评论(可选) */
  isCommentable?: boolean;
  /** 创建时间 */
  createAt: string;
  /** 更新时间 */
  updateAt: string;
  /** 发布时间 */
  publishAt: string;
  /** 子节点数组(可选) */
  children?: Array<IKnowledge>;
}

/**
 * 页面信息接口
 */
interface IPage {
  /** 页面ID */
  id: string;
  /** 页面名称 */
  name: string;
  /** 页面路径 */
  path: string;
  /** 封面图URL(可选) */
  cover?: string;
  /** 原始内容 */
  content: string;
  /** HTML内容 */
  html: string;
  /** 目录HTML */
  toc: string;
  /** 页面状态 */
  status: string;
  /** 浏览次数 */
  views: number;
  /** 创建时间 */
  createAt: string;
  /** 发布时间 */
  publishAt: string;
  /** 排序序号(可选) */
  order?: number;
}

/**
 * 评论信息接口
 */
interface IComment {
  /** 评论ID */
  id: string;
  /** 评论者名称 */
  name: string;
  /** 评论者邮箱 */
  email: string;
  /** 评论者头像URL */
  avatar: string;
  /** 评论内容 */
  content: string;
  /** 评论HTML内容 */
  html: string;
  /** 是否通过审核 */
  pass: boolean;
  /** 创建时间 */
  createAt: string;
  /** 用户代理信息 */
  userAgent: string;
  /** 关联文章(可选) */
  article?: IArticle;
  /** 父评论ID */
  parentCommentId: string;
  /** 宿主ID */
  hostId: string;
  /** 评论URL */
  url: string;
  /** 回复的用户名(可选) */
  replyUserName?: string;
  /** 回复的用户邮箱(可选) */
  replyUserEmail?: string;
  /** 子评论数组(可选) */
  children?: [IComment];
}

/**
 * 访问记录接口
 */
interface IView {
  /** 记录ID */
  id: string;
  /** 访问者IP */
  ip: string;
  /** 用户代理信息 */
  userAgent: string;
  /** 访问URL */
  url: string;
  /** 访问次数 */
  count: number;
  /** 创建时间 */
  createAt: string;
  /** 更新时间 */
  updateAt: string;
}

/**
 * 邮件信息接口
 */
interface IMail {
  /** 邮件ID */
  id: string;
  /** 发件人 */
  from: string;
  /** 收件人 */
  to: string;
  /** 邮件主题 */
  subject: number;
  /** 纯文本内容 */
  text: string;
  /** HTML内容 */
  html: string;
  /** 创建时间 */
  createAt: string;
}

/**
 * 搜索记录接口
 */
interface ISearch {
  /** 记录ID */
  id: string;
  /** 搜索类型 */
  type: string;
  /** 搜索关键词 */
  keyword: string;
  /** 搜索次数 */
  count: number;
  /** 创建时间 */
  createAt: string;
}

/**
 * 系统设置接口
 */
interface ISetting {
  /** 国际化设置(可选) */
  i18n?: string;
  /** 系统地址(可选) */
  systemUrl?: string;
  /** 系统标题(可选) */
  systemTitle?: string;
  /** 系统副标题(可选) */
  systemSubTitle?: string;
  /** 全局背景(可选) */
  systemBg?: string;
  /** 系统Logo(可选) */
  systemLogo?: string;
  /** 系统favicon(可选) */
  systemFavicon?: string;
  /** 系统页脚信息(可选) */
  systemFooterInfo?: string;
  /** 系统通知信息(可选) */
  systemNoticeInfo?: string;
  /** 后台系统地址(可选) */
  adminSystemUrl?: string;

  /** SEO关键词(可选) */
  seoKeyword?: string;
  /** SEO描述(可选) */
  seoDesc?: string;

  /** 百度统计ID(可选) */
  baiduAnalyticsId?: string;
  /** 谷歌分析ID(可选) */
  googleAnalyticsId?: string;

  /** 阿里云OSS区域(可选) */
  ossRegion?: string;
  /** 阿里云AccessKeyId(可选) */
  ossAccessKeyId?: string;
  /** 阿里云AccessKeySecret(可选) */
  ossAccessKeySecret?: string;
  /** 阿里云OSS是否开启HTTPS(可选) */
  ossHttps?: boolean;
  /** 阿里云Bucket名称(可选) */
  ossBucket?: string;

  /** OSS上传配置(可选) */
  oss?: string;

  /** SMTP主机地址(可选) */
  smtpHost?: string;
  /** SMTP端口(可选) */
  smtpPort?: number;
  /** SMTP用户名(可选) */
  smtpUser?: string;
  /** SMTP授权码(可选) */
  smtpPass?: string;
  /** SMTP发件人(可选) */
  smtpFromUser?: string;
  /** 全局设置(可选) */
  globalSetting?: string;
}