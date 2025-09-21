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
  IViewControllerCreateData,
  IViewControllerDeleteByIdData,
  IViewControllerFindAllData,
  IViewControllerFindByIdData,
  IViewControllerFindByUrlData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class View<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags View
   * @name ViewControllerCreate
   * @request POST:/view
   * @response `200` `IViewControllerCreateData` 访问记录添加成功
   */
  create = (params: RequestParams = {}) =>
    this.http.request<IViewControllerCreateData, any>({
      path: `/view`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerFindAll
   * @request GET:/view
   * @response `200` `IViewControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IViewControllerFindAllData, any>({
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
   * @response `200` `IViewControllerFindByUrlData`
   */
  findByUrl = (params: RequestParams = {}) =>
    this.http.request<IViewControllerFindByUrlData, any>({
      path: `/view/url`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerFindById
   * @request GET:/view/{id}
   * @response `200` `IViewControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<IViewControllerFindByIdData, any>({
      path: `/view/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerDeleteById
   * @request DELETE:/view/{id}
   * @response `200` `IViewControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<IViewControllerDeleteByIdData, any>({
      path: `/view/${id}`,
      method: 'DELETE',
      ...params,
    });
}
