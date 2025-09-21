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
import { HttpClient, RequestParams } from './httpClient';

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
   * @name findByCategory
   * @request GET:/article/category/{id}
   */
  findByCategory = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name findByTag
   * @request GET:/article/tag/{id}
   */
  findByTag = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name getRecommendations
   * @request GET:/article/all/recommend
   */
  getRecommendations = (params: RequestParams = {}) =>
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
   * @name updateViews
   * @request POST:/article/{id}/views
   */
  updateViews = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name updateLikes
   * @request POST:/article/{id}/likes
   */
  updateLikes = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
