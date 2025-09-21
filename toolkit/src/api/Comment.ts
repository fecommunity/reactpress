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

import { IComment } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Comment<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Comment
   * @name create
   * @request POST:/comment
   */
  create = (params: RequestParams = {}) =>
    this.request<IComment[], any>({
      path: `/comment`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name findAll
   * @request GET:/comment
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name findById
   * @request GET:/comment/{id}
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name updateById
   * @request PATCH:/comment/{id}
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name deleteById
   * @request DELETE:/comment/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name getArticleComments
   * @request GET:/comment/host/{hostId}
   */
  getArticleComments = (hostId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/host/${hostId}`,
      method: 'GET',
      ...params,
    });
}
