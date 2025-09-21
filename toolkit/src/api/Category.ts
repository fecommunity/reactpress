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
  updateByIdData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Category<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Category
   * @name create
   * @request POST:/category
   * @response `200` `createData` 添加分类
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/category`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name findAll
   * @request GET:/category
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
      path: `/category`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name findById
   * @request GET:/category/{id}
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
      path: `/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name updateById
   * @request PATCH:/category/{id}
   * @response `200` `updateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<updateByIdData, any>({
      path: `/category/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name deleteById
   * @request DELETE:/category/{id}
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/category/${id}`,
      method: 'DELETE',
      ...params,
    });
}
