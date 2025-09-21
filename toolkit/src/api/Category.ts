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

import { ICategory } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Category<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Category
   * @name Categorycreate
   * @request POST:/category
   */
  categorycreate = (params: RequestParams = {}) =>
    this.request<ICategory[], any>({
      path: `/category`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryfindAll
   * @request GET:/category
   */
  categoryfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/category`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryfindById
   * @request GET:/category/{id}
   */
  categoryfindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryupdateById
   * @request PATCH:/category/{id}
   */
  categoryupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/category/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategorydeleteById
   * @request DELETE:/category/{id}
   */
  categorydeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/category/${id}`,
      method: 'DELETE',
      ...params,
    });
}
