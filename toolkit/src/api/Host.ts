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

export class Host<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerGetArticleComments
   * @request GET:/comment/host/{hostId}
   * @response `200` `void`
   */
  commentControllerGetArticleComments = (hostId: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/comment/host/${hostId}`,
      method: 'GET',
      ...params,
    });
}
