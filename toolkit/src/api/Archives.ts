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

export class Archives<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerGetArchives
   * @request GET:/article/archives
   * @response `200` `void`
   */
  articleControllerGetArchives = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/archives`,
      method: 'GET',
      ...params,
    });
}
