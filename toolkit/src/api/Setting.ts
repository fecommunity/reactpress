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

import { findAllData, updateData } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Setting<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Setting
   * @name update
   * @request POST:/setting
   * @response `200` `updateData` 更新设置
   */
  update = (params: RequestParams = {}) =>
    this.request<updateData, any>({
      path: `/setting`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Setting
   * @name findAll
   * @request POST:/setting/get
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
      path: `/setting/get`,
      method: 'POST',
      ...params,
    });
}
