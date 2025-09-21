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

import { HttpClient, RequestParams } from './httpClient';

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLogin
   * @request POST:/auth/login
   */
  authControllerLogin = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/login`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name createBook
   * @request POST:/auth/admin
   */
  createBook = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/admin`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLoginWithGithub
   * @request POST:/auth/github
   */
  authControllerLoginWithGithub = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/github`,
      method: 'POST',
      ...params,
    });
}
