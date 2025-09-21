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

import { I_SMTP } from '../types/data-contracts';
import { HttpClient, RequestParams } from './httpClient';

export class Smtp<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Smtp
   * @name create
   * @request POST:/smtp
   */
  create = (params: RequestParams = {}) =>
    this.request<I_SMTP[], any>({
      path: `/smtp`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name findAll
   * @request GET:/smtp
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/smtp`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name deleteById
   * @request DELETE:/smtp/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/smtp/${id}`,
      method: 'DELETE',
      ...params,
    });
}
