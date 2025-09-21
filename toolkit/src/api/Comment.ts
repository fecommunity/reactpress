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
  ICommentControllerCreateData,
  ICommentControllerDeleteByIdData,
  ICommentControllerFindAllData,
  ICommentControllerFindByIdData,
  ICommentControllerGetArticleCommentsData,
  ICommentControllerUpdateByIdData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Comment<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerCreate
   * @request POST:/comment
   * @response `200` `ICommentControllerCreateData` 创建评论
   */
  create = (params: RequestParams = {}) =>
    this.http.request<ICommentControllerCreateData, any>({
      path: `/comment`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerFindAll
   * @request GET:/comment
   * @response `200` `ICommentControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ICommentControllerFindAllData, any>({
      path: `/comment`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerFindById
   * @request GET:/comment/{id}
   * @response `200` `ICommentControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICommentControllerFindByIdData, any>({
      path: `/comment/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerUpdateById
   * @request PATCH:/comment/{id}
   * @response `200` `ICommentControllerUpdateByIdData`
   */
  updateById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICommentControllerUpdateByIdData, any>({
      path: `/comment/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerDeleteById
   * @request DELETE:/comment/{id}
   * @response `200` `ICommentControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<ICommentControllerDeleteByIdData, any>({
      path: `/comment/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerGetArticleComments
   * @request GET:/comment/host/{hostId}
   * @response `200` `ICommentControllerGetArticleCommentsData`
   */
  getArticleComments = (hostId: string, params: RequestParams = {}) =>
    this.http.request<ICommentControllerGetArticleCommentsData, any>({
      path: `/comment/host/${hostId}`,
      method: 'GET',
      ...params,
    });
}
