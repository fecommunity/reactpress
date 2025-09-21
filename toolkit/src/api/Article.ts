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

export class Article<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Search
   * @name SearchControllerSearchArticle
   * @request GET:/search/article
   * @response `200` `void`
   */
  searchControllerSearchArticle = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/search/article`,
      method: 'GET',
      ...params,
    });
}
