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
import { HttpClient, RequestParams } from './HttpClient';

export class Smtp<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Smtp
   * @name Smtpcreate
   * @request POST:/smtp
   */
  smtpcreate = (params: RequestParams = {}) =>
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
   * @name SmtpfindAll
   * @request GET:/smtp
   */
  smtpfindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/smtp`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name SmtpdeleteById
   * @request DELETE:/smtp/{id}
   */
  smtpdeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/smtp/${id}`,
      method: 'DELETE',
      ...params,
    });
}
