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

import { ISettingControllerFindAllData, ISettingControllerUpdateData } from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Setting<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Setting
   * @name SettingControllerUpdate
   * @request POST:/setting
   * @response `200` `ISettingControllerUpdateData` 更新设置
   */
  update = (params: RequestParams = {}) =>
    this.http.request<ISettingControllerUpdateData, any>({
      path: `/setting`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Setting
   * @name SettingControllerFindAll
   * @request POST:/setting/get
   * @response `200` `ISettingControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ISettingControllerFindAllData, any>({
      path: `/setting/get`,
      method: 'POST',
      ...params,
    });
}
