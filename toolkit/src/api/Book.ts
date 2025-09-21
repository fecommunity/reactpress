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
import { HttpClient, RequestParams } from './http-client';

export class Book<SecurityDataType = unknown> {
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
   * @response `200` `(IKnowledge)[]` 创建知识库
   */
  knowledgeControllerCreateBook = (params: RequestParams = {}) =>
    this.http.request<IKnowledge[], any>({
      path: `/Knowledge/book`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
