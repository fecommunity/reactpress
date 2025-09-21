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

export class Password<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags User
   * @name UserControllerUpdatePassword
   * @request POST:/user/password
   * @response `201` `(IUser)[]` 更新密码成功
   */
  userControllerUpdatePassword = (params: RequestParams = {}) =>
    this.http.request<IUser[], any>({
      path: `/user/password`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
