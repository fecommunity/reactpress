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
   * @name Tagcreate
   * @request POST:/tag
   */
  tagcreate = (params: RequestParams = {}) =>
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
   * @name TagfindAll
   * @request GET:/tag
   */
  tagfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagfindById
   * @request GET:/tag/{id}
   */
  tagfindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagupdateById
   * @request PATCH:/tag/{id}
   */
  tagupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagdeleteById
   * @request DELETE:/tag/{id}
   */
  tagdeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TaggetArticleById
   * @request GET:/tag/{id}/article
   */
  taggetArticleById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/tag/${id}/article`,
      method: 'GET',
      ...params,
    });
}
