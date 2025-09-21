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
import { HttpClient, RequestParams } from './httpClient';

export class View<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags View
   * @name create
   * @request POST:/view
   */
  create = (params: RequestParams = {}) =>
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
   * @name findAll
   * @request GET:/view
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerFindByUrl
   * @request GET:/view/url
   */
  viewControllerFindByUrl = (params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/view/${id}`,
      method: 'DELETE',
      ...params,
    });
}
