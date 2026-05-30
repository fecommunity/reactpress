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
 * API 实体类型 — 基于 toolkit，并保留主题运行时常见扩展字段。
 */
type ToolkitArticle = import('@fecommunity/reactpress-toolkit/types').IArticle;
type IArticle = Omit<ToolkitArticle, 'tags'> & {
  tags?: Array<string | { id?: string; label?: string; value?: string }>;
};

type ITag = import('@fecommunity/reactpress-toolkit/types').ITag;
type ICategory = import('@fecommunity/reactpress-toolkit/types').ICategory;

type ToolkitKnowledge = import('@fecommunity/reactpress-toolkit/types').IKnowledge;
type IKnowledge = ToolkitKnowledge & {
  children?: IKnowledge[];
};

type IPage = import('@fecommunity/reactpress-toolkit/types').IPage;
type IComment = import('@fecommunity/reactpress-toolkit/types').IComment;
type IView = import('@fecommunity/reactpress-toolkit/types').IView;
type ISetting = import('@fecommunity/reactpress-toolkit/types').ISetting;

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
