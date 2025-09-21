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
  createBookData,
  createChapterData,
  deleteByIdData,
  findAllData,
  findByIdData,
  updateByIdData,
  updateLikesByIdData,
  updateViewsByIdData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Knowledge<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Knowledge
   * @name createBook
   * @request POST:/Knowledge/book
   * @response `200` `createBookData` 创建知识库
   */
  createBook = (params: RequestParams = {}) =>
    this.request<createBookData, any>({
      path: `/Knowledge/book`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name createChapter
   * @request POST:/Knowledge/chapter
   * @response `200` `createChapterData` 创建知识章节
   */
  createChapter = (params: RequestParams = {}) =>
    this.request<createChapterData, any>({
      path: `/Knowledge/chapter`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name deleteById
   * @request DELETE:/Knowledge/{id}
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name updateById
   * @request PATCH:/Knowledge/{id}
   * @response `200` `updateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<updateByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name findById
   * @request GET:/Knowledge/{id}
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name findAll
   * @request GET:/Knowledge
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
      path: `/Knowledge`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name updateViewsById
   * @request POST:/Knowledge/{id}/views
   * @response `200` `updateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<updateViewsByIdData, any>({
      path: `/Knowledge/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name updateLikesById
   * @request POST:/Knowledge/{id}/likes
   * @response `200` `updateLikesByIdData`
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<updateLikesByIdData, any>({
      path: `/Knowledge/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
