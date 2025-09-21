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
   * @name create
   * @request POST:/article
   */
  create = (params: RequestParams = {}) =>
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
   * @name findAll
   * @request GET:/article
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name findArticlesByCategory
   * @request GET:/article/category/{id}
   */
  findArticlesByCategory = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name findArticlesByTag
   * @request GET:/article/tag/{id}
   */
  findArticlesByTag = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name getRecommendArticles
   * @request GET:/article/all/recommend
   */
  getRecommendArticles = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/all/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name getArchives
   * @request GET:/article/archives
   */
  getArchives = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/archives`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name recommend
   * @request GET:/article/recommend
   */
  recommend = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name findById
   * @request GET:/article/{id}
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name updateById
   * @request PATCH:/article/{id}
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name deleteById
   * @request DELETE:/article/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name checkPassword
   * @request POST:/article/{id}/checkPassword
   */
  checkPassword = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/checkPassword`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name updateViewsById
   * @request POST:/article/{id}/views
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name updateLikesById
   * @request POST:/article/{id}/likes
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
