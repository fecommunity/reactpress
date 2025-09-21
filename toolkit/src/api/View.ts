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

import { IView } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class View<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags View
   * @name Viewcreate
   * @request POST:/view
   */
  viewcreate = (params: RequestParams = {}) =>
    this.request<IView[], any>({
      path: `/view`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewfindAll
   * @request GET:/view
   */
  viewfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewfindByUrl
   * @request GET:/view/url
   */
  viewfindByUrl = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view/url`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewfindById
   * @request GET:/view/{id}
   */
  viewfindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewdeleteById
   * @request DELETE:/view/{id}
   */
  viewdeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view/${id}`,
      method: 'DELETE',
      ...params,
    });
}
