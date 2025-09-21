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
   * @name KnowledgecreateBook
   * @request POST:/Knowledge/book
   */
  knowledgecreateBook = (params: RequestParams = {}) =>
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
   * @name KnowledgecreateChapter
   * @request POST:/Knowledge/chapter
   */
  knowledgecreateChapter = (params: RequestParams = {}) =>
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
   * @name KnowledgedeleteById
   * @request DELETE:/Knowledge/{id}
   */
  knowledgedeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeupdateById
   * @request PATCH:/Knowledge/{id}
   */
  knowledgeupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgefindById
   * @request GET:/Knowledge/{id}
   */
  knowledgefindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgefindAll
   * @request GET:/Knowledge
   */
  knowledgefindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeupdateViewsById
   * @request POST:/Knowledge/{id}/views
   */
  knowledgeupdateViewsById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeupdateLikesById
   * @request POST:/Knowledge/{id}/likes
   */
  knowledgeupdateLikesById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/Knowledge/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
