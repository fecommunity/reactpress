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

import { HttpClient, RequestParams } from './http-client';

export class Github<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLoginWithGithub
   * @request POST:/auth/github
   * @response `201` `void`
   */
  authControllerLoginWithGithub = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/auth/github`,
      method: 'POST',
      ...params,
    });
}
