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

import { ISetting } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Setting<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Setting
   * @name Settingupdate
   * @request POST:/setting
   */
  settingupdate = (params: RequestParams = {}) =>
    this.request<ISetting[], any>({
      path: `/setting`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Setting
   * @name SettingfindAll
   * @request POST:/setting/get
   */
  settingfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/setting/get`,
      method: 'POST',
      ...params,
    });
}
