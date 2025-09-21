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
   * @name create
   * @request POST:/category
   */
  create = (params: RequestParams = {}) =>
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
   * @name findAll
   * @request GET:/category
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/category/${id}`,
      method: 'DELETE',
      ...params,
    });
}
