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

import { HttpClient, RequestParams } from './http-client';

export class Id<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Smtp
   * @name SmtpControllerDeleteById
   * @request DELETE:/smtp/{id}
   * @response `200` `void`
   */
  smtpControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/smtp/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FileControllerFindById
   * @request GET:/file/{id}
   * @response `200` `void`
   */
  fileControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/file/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FileControllerDeleteById
   * @request DELETE:/file/{id}
   * @response `200` `void`
   */
  fileControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/file/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerFindById
   * @request GET:/tag/{id}
   * @response `200` `void`
   */
  tagControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/tag/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerUpdateById
   * @request PATCH:/tag/{id}
   * @response `200` `void`
   */
  tagControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/tag/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerDeleteById
   * @request DELETE:/tag/{id}
   * @response `200` `void`
   */
  tagControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/tag/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name TagControllerGetArticleById
   * @request GET:/tag/{id}/article
   * @response `200` `void`
   */
  tagControllerGetArticleById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/tag/${id}/article`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerFindById
   * @request GET:/article/{id}
   * @response `200` `void`
   */
  articleControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateById
   * @request PATCH:/article/{id}
   * @response `200` `void`
   */
  articleControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerDeleteById
   * @request DELETE:/article/{id}
   * @response `200` `void`
   */
  articleControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerCheckPassword
   * @request POST:/article/{id}/checkPassword
   * @response `200` `void`
   */
  articleControllerCheckPassword = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}/checkPassword`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateViewsById
   * @request POST:/article/{id}/views
   * @response `200` `void`
   */
  articleControllerUpdateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Article
   * @name ArticleControllerUpdateLikesById
   * @request POST:/article/{id}/likes
   * @response `200` `void`
   */
  articleControllerUpdateLikesById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/article/${id}/likes`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerFindById
   * @request GET:/category/{id}
   * @response `200` `void`
   */
  categoryControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/category/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerUpdateById
   * @request PATCH:/category/{id}
   * @response `200` `void`
   */
  categoryControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/category/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Category
   * @name CategoryControllerDeleteById
   * @request DELETE:/category/{id}
   * @response `200` `void`
   */
  categoryControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/category/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerDeleteById
   * @request DELETE:/Knowledge/{id}
   * @response `200` `void`
   */
  knowledgeControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
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
   * @response `200` `void`
   */
  knowledgeControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
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
   * @response `200` `void`
   */
  knowledgeControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/Knowledge/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerUpdateViewsById
   * @request POST:/Knowledge/{id}/views
   * @response `200` `void`
   */
  knowledgeControllerUpdateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
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
   * @response `200` `void`
   */
  knowledgeControllerUpdateLikesById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/Knowledge/${id}/likes`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Comment
   * @name CommentControllerFindById
   * @request GET:/comment/{id}
   * @response `200` `void`
   */
  commentControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
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
   * @response `200` `void`
   */
  commentControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
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
   * @response `200` `void`
   */
  commentControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/comment/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerFindById
   * @request GET:/page/{id}
   * @response `200` `void`
   */
  pageControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/page/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerUpdateById
   * @request PATCH:/page/{id}
   * @response `200` `void`
   */
  pageControllerUpdateById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/page/${id}`,
      method: 'PATCH',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerDeleteById
   * @request DELETE:/page/{id}
   * @response `200` `void`
   */
  pageControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/page/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Page
   * @name PageControllerUpdateViewsById
   * @request POST:/page/{id}/views
   * @response `200` `void`
   */
  pageControllerUpdateViewsById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/page/${id}/views`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerFindById
   * @request GET:/view/{id}
   * @response `200` `void`
   */
  viewControllerFindById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/view/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewControllerDeleteById
   * @request DELETE:/view/{id}
   * @response `200` `void`
   */
  viewControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/view/${id}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Search
   * @name SearchControllerDeleteById
   * @request DELETE:/search/{id}
   * @response `200` `void`
   */
  searchControllerDeleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<void, any>({
      path: `/search/${id}`,
      method: 'DELETE',
      ...params,
    });
}
