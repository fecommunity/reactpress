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

import {
  checkPasswordData,
  createData,
  deleteByIdData,
  findAllData,
  findArticlesByCategoryData,
  findArticlesByTagData,
  findByIdData,
  getArchivesData,
  getRecommendArticlesData,
  recommendData,
  updateByIdData,
  updateLikesByIdData,
  updateViewsByIdData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Article<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Article
   * @name create
   * @request POST:/article
   * @response `200` `createData` 创建文章
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/article`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name findAll
   * @request GET:/article
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
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
   * @response `200` `findArticlesByCategoryData`
   */
  findArticlesByCategory = (id: string, params: RequestParams = {}) =>
    this.request<findArticlesByCategoryData, any>({
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
   * @response `200` `findArticlesByTagData`
   */
  findArticlesByTag = (id: string, params: RequestParams = {}) =>
    this.request<findArticlesByTagData, any>({
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
   * @response `200` `getRecommendArticlesData`
   */
  getRecommendArticles = (params: RequestParams = {}) =>
    this.request<getRecommendArticlesData, any>({
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
   * @response `200` `getArchivesData`
   */
  getArchives = (params: RequestParams = {}) =>
    this.request<getArchivesData, any>({
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
   * @response `200` `recommendData`
   */
  recommend = (params: RequestParams = {}) =>
    this.request<recommendData, any>({
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
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
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
   * @response `200` `updateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<updateByIdData, any>({
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
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
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
   * @response `200` `checkPasswordData`
   */
  checkPassword = (id: string, params: RequestParams = {}) =>
    this.request<checkPasswordData, any>({
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
   * @response `200` `updateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<updateViewsByIdData, any>({
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
   * @response `200` `updateLikesByIdData`
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<updateLikesByIdData, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
