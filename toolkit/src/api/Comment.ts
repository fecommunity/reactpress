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
  createData,
  deleteByIdData,
  findAllData,
  findByIdData,
  getArticleCommentsData,
  updateByIdData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Comment<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Comment
   * @name create
   * @request POST:/comment
   * @response `200` `createData` 创建评论
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/comment`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name findAll
   * @request GET:/comment
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
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
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
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
   * @response `200` `updateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<updateByIdData, any>({
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
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
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
   * @response `200` `getArticleCommentsData`
   */
  getArticleComments = (hostId: string, params: RequestParams = {}) =>
    this.request<getArticleCommentsData, any>({
      path: `/comment/host/${hostId}`,
      method: 'GET',
      ...params,
    });
}
