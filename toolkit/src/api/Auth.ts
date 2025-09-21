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

import { HttpClient, RequestParams } from './HttpClient';

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Auth
   * @name login
   * @request POST:/auth/login
   */
  login = (params: RequestParams = {}) =>
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
   * @name loginWithGithub
   * @request POST:/auth/github
   */
  loginWithGithub = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/github`,
      method: 'POST',
      ...params,
    });
}
