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
  updateViewsByIdData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Page<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Page
   * @name create
   * @request POST:/page
   * @response `200` `createData` 创建页面
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/page`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name findAll
   * @request GET:/page
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
      path: `/page`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name findById
   * @request GET:/page/{id}
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
      path: `/page/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name updateById
   * @request PATCH:/page/{id}
   * @response `200` `updateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<updateByIdData, any>({
      path: `/page/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name deleteById
   * @request DELETE:/page/{id}
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/page/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name updateViewsById
   * @request POST:/page/{id}/views
   * @response `200` `updateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<updateViewsByIdData, any>({
      path: `/page/${id}/views`,
      method: 'POST',
      ...params,
    });
}
