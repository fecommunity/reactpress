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

export class Recommend<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerRecommend
   * @request GET:/article/recommend
   * @response `200` `void`
   */
  articleControllerRecommend = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/recommend`,
      method: 'GET',
      ...params,
    });
}
