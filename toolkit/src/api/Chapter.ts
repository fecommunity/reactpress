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

export class Chapter<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Knowledge
   * @name KnowledgeControllerCreateChapter
   * @request POST:/Knowledge/chapter
   * @response `200` `(IKnowledge)[]` 创建知识章节
   */
  knowledgeControllerCreateChapter = (params: RequestParams = {}) =>
    this.http.request<IKnowledge[], any>({
      path: `/Knowledge/chapter`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
