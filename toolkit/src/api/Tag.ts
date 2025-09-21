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
  ITagControllerCreateData,
  ITagControllerDeleteByIdData,
  ITagControllerFindAllData,
  ITagControllerFindByIdData,
  ITagControllerGetArticleByIdData,
  ITagControllerUpdateByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Tag<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerCreate
   * @request POST:/tag
   * @response `200` `ITagControllerCreateData` 创建标签
   */
  create = (params: RequestParams = {}) =>
    this.http.request<ITagControllerCreateData, any>({
      path: `/tag`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerFindAll
   * @request GET:/tag
   * @response `200` `ITagControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ITagControllerFindAllData, any>({
      path: `/tag`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerFindById
   * @request GET:/tag/{id}
   * @response `200` `ITagControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<ITagControllerFindByIdData, any>({
      path: `/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerUpdateById
   * @request PATCH:/tag/{id}
   * @response `200` `ITagControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<ITagControllerUpdateByIdData, any>({
      path: `/tag/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerDeleteById
   * @request DELETE:/tag/{id}
   * @response `200` `ITagControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<ITagControllerDeleteByIdData, any>({
      path: `/tag/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerGetArticleById
   * @request GET:/tag/{id}/article
   * @response `200` `ITagControllerGetArticleByIdData`
   */
  getArticleById = (id: string, params: RequestParams = {}) =>
    this.http.request<ITagControllerGetArticleByIdData, any>({
      path: `/tag/${id}/article`,
      method: 'GET',
      ...params,
    });
}
