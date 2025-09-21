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
  ICategoryControllerCreateData,
  ICategoryControllerDeleteByIdData,
  ICategoryControllerFindAllData,
  ICategoryControllerFindByIdData,
  ICategoryControllerUpdateByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Category<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerCreate
   * @request POST:/category
   * @response `200` `ICategoryControllerCreateData` 添加分类
   */
  create = (params: RequestParams = {}) =>
    this.http.request<ICategoryControllerCreateData, any>({
      path: `/category`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerFindAll
   * @request GET:/category
   * @response `200` `ICategoryControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ICategoryControllerFindAllData, any>({
      path: `/category`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerFindById
   * @request GET:/category/{id}
   * @response `200` `ICategoryControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICategoryControllerFindByIdData, any>({
      path: `/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerUpdateById
   * @request PATCH:/category/{id}
   * @response `200` `ICategoryControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICategoryControllerUpdateByIdData, any>({
      path: `/category/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerDeleteById
   * @request DELETE:/category/{id}
   * @response `200` `ICategoryControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICategoryControllerDeleteByIdData, any>({
      path: `/category/${id}`,
      method: 'DELETE',
      ...params,
    });
}
