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

import { ITag } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Tag<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Tag
   * @name create
   * @request POST:/tag
   */
  create = (params: RequestParams = {}) =>
    this.request<ITag[], any>({
      path: `/tag`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name findAll
   * @request GET:/tag
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name findById
   * @request GET:/tag/{id}
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name updateById
   * @request PATCH:/tag/{id}
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name deleteById
   * @request DELETE:/tag/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name getArticleById
   * @request GET:/tag/{id}/article
   */
  getArticleById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}/article`,
      method: 'GET',
      ...params,
    });
}
