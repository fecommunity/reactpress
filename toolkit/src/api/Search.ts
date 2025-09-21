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
   * @name SearchsearchArticle
   * @request GET:/search/article
   */
  searchsearchArticle = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name SearchfindAll
   * @request GET:/search
   */
  searchfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name SearchdeleteById
   * @request DELETE:/search/{id}
   */
  searchdeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/search/${id}`,
      method: 'DELETE',
      ...params,
    });
}
