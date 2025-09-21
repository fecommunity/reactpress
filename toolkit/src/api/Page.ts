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
   * @name Pagecreate
   * @request POST:/page
   */
  pagecreate = (params: RequestParams = {}) =>
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
   * @name PagefindAll
   * @request GET:/page
   */
  pagefindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PagefindById
   * @request GET:/page/{id}
   */
  pagefindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageupdateById
   * @request PATCH:/page/{id}
   */
  pageupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PagedeleteById
   * @request DELETE:/page/{id}
   */
  pagedeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageupdateViewsById
   * @request POST:/page/{id}/views
   */
  pageupdateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/page/${id}/views`,
      method: 'POST',
      ...params,
    });
}
