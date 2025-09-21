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

import {
  deleteByIdData,
  findAllData,
  searchArticleData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Search<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Search
   * @name searchArticle
   * @request GET:/search/article
   * @response `200` `searchArticleData`
   */
  searchArticle = (params: RequestParams = {}) =>
    this.request<searchArticleData, any>({
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
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
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
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/search/${id}`,
      method: 'DELETE',
      ...params,
    });
}
