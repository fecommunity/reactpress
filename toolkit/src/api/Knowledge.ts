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

import { IKnowledge } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Knowledge<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Knowledge
   * @name createBook
   * @request POST:/Knowledge/book
   */
  createBook = (params: RequestParams = {}) =>
    this.request<IKnowledge[], any>({
      path: `/Knowledge/book`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name createChapter
   * @request POST:/Knowledge/chapter
   */
  createChapter = (params: RequestParams = {}) =>
    this.request<IKnowledge[], any>({
      path: `/Knowledge/chapter`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name deleteById
   * @request DELETE:/Knowledge/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
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
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
