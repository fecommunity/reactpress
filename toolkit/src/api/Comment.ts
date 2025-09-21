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

import { IComment } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Comment<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Comment
   * @name Commentcreate
   * @request POST:/comment
   */
  commentcreate = (params: RequestParams = {}) =>
    this.request<IComment[], any>({
      path: `/comment`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentfindAll
   * @request GET:/comment
   */
  commentfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentfindById
   * @request GET:/comment/{id}
   */
  commentfindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentupdateById
   * @request PATCH:/comment/{id}
   */
  commentupdateById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentdeleteById
   * @request DELETE:/comment/{id}
   */
  commentdeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentgetArticleComments
   * @request GET:/comment/host/{hostId}
   */
  commentgetArticleComments = (hostId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/comment/host/${hostId}`,
      method: 'GET',
      ...params,
    });
}
