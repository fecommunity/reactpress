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

export type IUserControllerFindAllData = IUser[];

export type IUserControllerRegisterData = IUser[];

export type IUserControllerUpdateData = IUser[];

export type IUserControllerUpdatePasswordData = IUser[];

export type IAuthControllerLoginData = any;

export type IAuthControllerCreateBookData = any;

export type IAuthControllerLoginWithGithubData = any;

export type ISettingControllerUpdateData = ISetting[];

export type ISettingControllerFindAllData = any;

export type ISmtpControllerCreateData = I_SMTP[];

export type ISmtpControllerFindAllData = any;

export type ISmtpControllerDeleteByIdData = any;

export type IFileControllerUploadFileData = IFile[];

export type IFileControllerFindAllData = any;

export type IFileControllerFindByIdData = any;

export type IFileControllerDeleteByIdData = any;

export type ITagControllerCreateData = ITag[];

export type ITagControllerFindAllData = any;

export type ITagControllerFindByIdData = any;

export type ITagControllerUpdateByIdData = any;

export type ITagControllerDeleteByIdData = any;

export type ITagControllerGetArticleByIdData = any;

export type IArticleControllerCreateData = IArticle[];

export type IArticleControllerFindAllData = any;

export type IArticleControllerFindArticlesByCategoryData = any;

export type IArticleControllerFindArticlesByTagData = any;

export type IArticleControllerGetRecommendArticlesData = any;

export type IArticleControllerGetArchivesData = any;

export type IArticleControllerRecommendData = any;

export type IArticleControllerFindByIdData = any;

export type IArticleControllerUpdateByIdData = any;

export type IArticleControllerDeleteByIdData = any;

export type IArticleControllerCheckPasswordData = any;

export type IArticleControllerUpdateViewsByIdData = any;

export type IArticleControllerUpdateLikesByIdData = any;

export type ICategoryControllerCreateData = ICategory[];

export type ICategoryControllerFindAllData = any;

export type ICategoryControllerFindByIdData = any;

export type ICategoryControllerUpdateByIdData = any;

export type ICategoryControllerDeleteByIdData = any;

export type IKnowledgeControllerCreateBookData = IKnowledge[];

export type IKnowledgeControllerCreateChapterData = IKnowledge[];

export type IKnowledgeControllerDeleteByIdData = any;

export type IKnowledgeControllerUpdateByIdData = any;

export type IKnowledgeControllerFindByIdData = any;

export type IKnowledgeControllerFindAllData = any;

export type IKnowledgeControllerUpdateViewsByIdData = any;

export type IKnowledgeControllerUpdateLikesByIdData = any;

export type ICommentControllerCreateData = IComment[];

export type ICommentControllerFindAllData = any;

export type ICommentControllerFindByIdData = any;

export type ICommentControllerUpdateByIdData = any;

export type ICommentControllerDeleteByIdData = any;

export type ICommentControllerGetArticleCommentsData = any;

export type IPageControllerCreateData = IPage[];

export type IPageControllerFindAllData = any;

export type IPageControllerFindByIdData = any;

export type IPageControllerUpdateByIdData = any;

export type IPageControllerDeleteByIdData = any;

export type IPageControllerUpdateViewsByIdData = any;

export type IViewControllerCreateData = IView[];

export type IViewControllerFindAllData = any;

export type IViewControllerFindByUrlData = any;

export type IViewControllerFindByIdData = any;

export type IViewControllerDeleteByIdData = any;

export type ISearchControllerSearchArticleData = any;

export type ISearchControllerFindAllData = any;

export type ISearchControllerDeleteByIdData = any;
