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
  IPageControllerCreateData,
  IPageControllerDeleteByIdData,
  IPageControllerFindAllData,
  IPageControllerFindByIdData,
  IPageControllerUpdateByIdData,
  IPageControllerUpdateViewsByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Page<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Page
   * @name PageControllerCreate
   * @request POST:/page
   * @response `200` `IPageControllerCreateData` 创建页面
   */
  create = (params: RequestParams = {}) =>
    this.http.request<IPageControllerCreateData, any>({
      path: `/page`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerFindAll
   * @request GET:/page
   * @response `200` `IPageControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IPageControllerFindAllData, any>({
      path: `/page`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerFindById
   * @request GET:/page/{id}
   * @response `200` `IPageControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<IPageControllerFindByIdData, any>({
      path: `/page/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerUpdateById
   * @request PATCH:/page/{id}
   * @response `200` `IPageControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<IPageControllerUpdateByIdData, any>({
      path: `/page/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerDeleteById
   * @request DELETE:/page/{id}
   * @response `200` `IPageControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<IPageControllerDeleteByIdData, any>({
      path: `/page/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerUpdateViewsById
   * @request POST:/page/{id}/views
   * @response `200` `IPageControllerUpdateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<IPageControllerUpdateViewsByIdData, any>({
      path: `/page/${id}/views`,
      method: 'POST',
      ...params,
    });
}
