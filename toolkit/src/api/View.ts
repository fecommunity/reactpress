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
  findByUrlData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class View<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags View
   * @name create
   * @request POST:/view
   * @response `200` `createData` 访问记录添加成功
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/view`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name findAll
   * @request GET:/view
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
      path: `/view`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name findByUrl
   * @request GET:/view/url
   * @response `200` `findByUrlData`
   */
  findByUrl = (params: RequestParams = {}) =>
    this.request<findByUrlData, any>({
      path: `/view/url`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name findById
   * @request GET:/view/{id}
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
      path: `/view/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name deleteById
   * @request DELETE:/view/{id}
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/view/${id}`,
      method: 'DELETE',
      ...params,
    });
}
