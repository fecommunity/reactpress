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

import { IPage } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Page<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Page
   * @name create
   * @request POST:/page
   */
  create = (params: RequestParams = {}) =>
    this.request<IPage[], any>({
      path: `/page`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name findAll
   * @request GET:/page
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page/${id}/views`,
      method: 'POST',
      ...params,
    });
}
