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

export class Category<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindArticlesByCategory
   * @request GET:/article/category/{id}
   * @response `200` `void`
   */
  articleControllerFindArticlesByCategory = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/category/${id}`,
      method: 'GET',
      ...params,
    });
}
