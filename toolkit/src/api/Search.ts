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
  ISearchControllerDeleteByIdData,
  ISearchControllerFindAllData,
  ISearchControllerSearchArticleData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Search<SecurityDataType = unknown> {
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
   * @response `200` `ISearchControllerSearchArticleData`
   */
  searchArticle = (params: RequestParams = {}) =>
    this.http.request<ISearchControllerSearchArticleData, any>({
      path: `/search/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name SearchControllerFindAll
   * @request GET:/search
   * @response `200` `ISearchControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ISearchControllerFindAllData, any>({
      path: `/search`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name SearchControllerDeleteById
   * @request DELETE:/search/{id}
   * @response `200` `ISearchControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<ISearchControllerDeleteByIdData, any>({
      path: `/search/${id}`,
      method: 'DELETE',
      ...params,
    });
}
