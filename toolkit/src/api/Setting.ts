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
import { HttpClient, RequestParams } from './httpClient';

export class Setting<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Setting
   * @name SettingControllerUpdate
   * @request POST:/setting
   */
  settingControllerUpdate = (params: RequestParams = {}) =>
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
   * @name findAll
   * @request POST:/setting/get
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/setting/get`,
      method: 'POST',
      ...params,
    });
}
