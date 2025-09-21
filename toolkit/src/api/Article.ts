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
  IArticleControllerCheckPasswordData,
  IArticleControllerCreateData,
  IArticleControllerDeleteByIdData,
  IArticleControllerFindAllData,
  IArticleControllerFindArticlesByCategoryData,
  IArticleControllerFindArticlesByTagData,
  IArticleControllerFindByIdData,
  IArticleControllerGetArchivesData,
  IArticleControllerGetRecommendArticlesData,
  IArticleControllerRecommendData,
  IArticleControllerUpdateByIdData,
  IArticleControllerUpdateLikesByIdData,
  IArticleControllerUpdateViewsByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Article<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerCreate
   * @request POST:/article
   * @response `200` `IArticleControllerCreateData` 创建文章
   */
  create = (params: RequestParams = {}) =>
    this.http.request<IArticleControllerCreateData, any>({
      path: `/article`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindAll
   * @request GET:/article
   * @response `200` `IArticleControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IArticleControllerFindAllData, any>({
      path: `/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindArticlesByCategory
   * @request GET:/article/category/{id}
   * @response `200` `IArticleControllerFindArticlesByCategoryData`
   */
  findArticlesByCategory = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerFindArticlesByCategoryData, any>({
      path: `/article/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindArticlesByTag
   * @request GET:/article/tag/{id}
   * @response `200` `IArticleControllerFindArticlesByTagData`
   */
  findArticlesByTag = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerFindArticlesByTagData, any>({
      path: `/article/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerGetRecommendArticles
   * @request GET:/article/all/recommend
   * @response `200` `IArticleControllerGetRecommendArticlesData`
   */
  getRecommendArticles = (params: RequestParams = {}) =>
    this.http.request<IArticleControllerGetRecommendArticlesData, any>({
      path: `/article/all/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerGetArchives
   * @request GET:/article/archives
   * @response `200` `IArticleControllerGetArchivesData`
   */
  getArchives = (params: RequestParams = {}) =>
    this.http.request<IArticleControllerGetArchivesData, any>({
      path: `/article/archives`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerRecommend
   * @request GET:/article/recommend
   * @response `200` `IArticleControllerRecommendData`
   */
  recommend = (params: RequestParams = {}) =>
    this.http.request<IArticleControllerRecommendData, any>({
      path: `/article/recommend`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindById
   * @request GET:/article/{id}
   * @response `200` `IArticleControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerFindByIdData, any>({
      path: `/article/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateById
   * @request PATCH:/article/{id}
   * @response `200` `IArticleControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerUpdateByIdData, any>({
      path: `/article/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerDeleteById
   * @request DELETE:/article/{id}
   * @response `200` `IArticleControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerDeleteByIdData, any>({
      path: `/article/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerCheckPassword
   * @request POST:/article/{id}/checkPassword
   * @response `200` `IArticleControllerCheckPasswordData`
   */
  checkPassword = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerCheckPasswordData, any>({
      path: `/article/${id}/checkPassword`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateViewsById
   * @request POST:/article/{id}/views
   * @response `200` `IArticleControllerUpdateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerUpdateViewsByIdData, any>({
      path: `/article/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateLikesById
   * @request POST:/article/{id}/likes
   * @response `200` `IArticleControllerUpdateLikesByIdData`
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.http.request<IArticleControllerUpdateLikesByIdData, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
