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
  IKnowledgeControllerCreateBookData,
  IKnowledgeControllerCreateChapterData,
  IKnowledgeControllerDeleteByIdData,
  IKnowledgeControllerFindAllData,
  IKnowledgeControllerFindByIdData,
  IKnowledgeControllerUpdateByIdData,
  IKnowledgeControllerUpdateLikesByIdData,
  IKnowledgeControllerUpdateViewsByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Knowledge<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerCreateBook
   * @request POST:/Knowledge/book
   * @response `200` `IKnowledgeControllerCreateBookData` 创建知识库
   */
  createBook = (params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerCreateBookData, any>({
      path: `/Knowledge/book`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerCreateChapter
   * @request POST:/Knowledge/chapter
   * @response `200` `IKnowledgeControllerCreateChapterData` 创建知识章节
   */
  createChapter = (params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerCreateChapterData, any>({
      path: `/Knowledge/chapter`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerDeleteById
   * @request DELETE:/Knowledge/{id}
   * @response `200` `IKnowledgeControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerDeleteByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerUpdateById
   * @request PATCH:/Knowledge/{id}
   * @response `200` `IKnowledgeControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerUpdateByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerFindById
   * @request GET:/Knowledge/{id}
   * @response `200` `IKnowledgeControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerFindByIdData, any>({
      path: `/Knowledge/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerFindAll
   * @request GET:/Knowledge
   * @response `200` `IKnowledgeControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerFindAllData, any>({
      path: `/Knowledge`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerUpdateViewsById
   * @request POST:/Knowledge/{id}/views
   * @response `200` `IKnowledgeControllerUpdateViewsByIdData`
   */
  updateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerUpdateViewsByIdData, any>({
      path: `/Knowledge/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerUpdateLikesById
   * @request POST:/Knowledge/{id}/likes
   * @response `200` `IKnowledgeControllerUpdateLikesByIdData`
   */
  updateLikesById = (id: string, params: RequestParams = {}) =>
    this.http.request<IKnowledgeControllerUpdateLikesByIdData, any>({
      path: `/Knowledge/${id}/likes`,
      method: 'POST',
      ...params,
    });
}
