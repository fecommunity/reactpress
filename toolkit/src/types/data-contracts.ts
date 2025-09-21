/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface IUser {
  name: string;
  password: string;
  avatar: string;
  email: string;
  role: string;
  status: string;
  type: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface ISetting {
  id: string;
  i18n: string;
  globalSetting: string;
  systemUrl: string;
  systemTitle: string;
  systemSubTitle: string;
  systemLogo: string;
  systemBg: string;
  systemFavicon: string;
  systemNoticeInfo: string;
  systemFooterInfo: string;
  adminSystemUrl: string;
  baiduAnalyticsId: string;
  googleAnalyticsId: string;
  seoKeyword: string;
  seoDesc: string;
  oss: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromUser: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface I_SMTP {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  /** @format date-time */
  createAt: string;
}

export interface IFile {
  id: string;
  originalname: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  /** @format date-time */
  createAt: string;
}

export interface ITag {
  label: string;
  value: string;
  articles: string[];
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface ICategory {
  id: string;
  label: string;
  value: string;
  articles: string[];
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface IArticle {
  id: string;
  title: string;
  cover: string;
  summary: string;
  content: string;
  html: string;
  toc: string;
  category: ICategory;
  tags: string[];
  status: string;
  views: number;
  likes: number;
  isRecommended: boolean;
  password: string;
  needPassword: boolean;
  isCommentable: boolean;
  /** @format date-time */
  publishAt: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface IKnowledge {
  id: string;
  parentId: string;
  order: number;
  title: string;
  cover: string;
  summary: string;
  content: string;
  html: string;
  toc: string;
  status: string;
  views: number;
  likes: number;
  isCommentable: boolean;
  /** @format date-time */
  publishAt: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface IComment {
  id: string;
  name: string;
  email: string;
  avatar: string;
  content: string;
  html: string;
  pass: boolean;
  userAgent: string;
  hostId: string;
  url: string;
  parentCommentId: string;
  replyUserName: string;
  replyUserEmail: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface IPage {
  id: string;
  cover: string;
  name: string;
  path: string;
  order: number;
  content: string;
  html: string;
  toc: string;
  status: string;
  /** @format date-time */
  publishAt: string;
  views: number;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}

export interface IView {
  ip: string;
  userAgent: string;
  url: string;
  count: number;
  address: string;
  browser: string;
  engine: string;
  os: string;
  device: string;
  /** @format date-time */
  createAt: string;
  /** @format date-time */
  updateAt: string;
}
