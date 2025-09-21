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

export class Register<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags User
   * @name UserControllerRegister
   * @request POST:/user/register
   * @response `201` `(IUser)[]` 创建用户
   */
  userControllerRegister = (params: RequestParams = {}) =>
    this.http.request<IUser[], any>({
      path: `/user/register`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
