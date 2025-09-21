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

export class Tag<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindArticlesByTag
   * @request GET:/article/tag/{id}
   * @response `200` `void`
   */
  articleControllerFindArticlesByTag = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/tag/${id}`,
      method: 'GET',
      ...params,
    });
}
