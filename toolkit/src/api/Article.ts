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

import { IArticle } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Article<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Article
   * @name Articlecreate
   * @request POST:/article
   */
  articlecreate = (params: RequestParams = {}) =>
    this.request<IArticle[], any>({
      path: `/article`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlefindAll
   * @request GET:/article
   */
  articlefindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlefindArticlesByCategory
   * @request GET:/article/category/{id}
   */
  articlefindArticlesByCategory = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlefindArticlesByTag
   * @request GET:/article/tag/{id}
   */
  articlefindArticlesByTag = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlegetRecommendArticles
   * @request GET:/article/all/recommend
   */
  articlegetRecommendArticles = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/all/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlegetArchives
   * @request GET:/article/archives
   */
  articlegetArchives = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/archives`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name Articlerecommend
   * @request GET:/article/recommend
   */
  articlerecommend = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlefindById
   * @request GET:/article/{id}
   */
  articlefindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleupdateById
   * @request PATCH:/article/{id}
   */
  articleupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticledeleteById
   * @request DELETE:/article/{id}
   */
  articledeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticlecheckPassword
   * @request POST:/article/{id}/checkPassword
   */
  articlecheckPassword = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/checkPassword`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleupdateViewsById
   * @request POST:/article/{id}/views
   */
  articleupdateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleupdateLikesById
   * @request POST:/article/{id}/likes
   */
  articleupdateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
