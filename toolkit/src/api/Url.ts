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

export class Url<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags View
   * @name ViewControllerFindByUrl
   * @request GET:/view/url
   * @response `200` `void`
   */
  viewControllerFindByUrl = (params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/view/url`,
      method: 'GET',
      ...params,
    });
}
