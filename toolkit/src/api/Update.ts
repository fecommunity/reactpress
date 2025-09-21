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

import { IUser } from '../types/data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class Update<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags User
   * @name UserControllerUpdate
   * @request POST:/user/update
   * @response `200` `(IUser)[]` 更新用户成功
   */
  userControllerUpdate = (params: RequestParams = {}) =>
    this.http.request<IUser[], any>({
      path: `/user/update`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
