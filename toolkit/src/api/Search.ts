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

export class Search<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Search
   * @name searchArticle
   * @request GET:/search/article
   */
  searchArticle = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name findAll
   * @request GET:/search
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name deleteById
   * @request DELETE:/search/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search/${id}`,
      method: 'DELETE',
      ...params,
    });
}
