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

import { ISmtpControllerCreateData, ISmtpControllerDeleteByIdData, ISmtpControllerFindAllData } from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Smtp<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Smtp
   * @name SmtpControllerCreate
   * @request POST:/smtp
   * @response `200` `ISmtpControllerCreateData` 发送邮件
   */
  create = (params: RequestParams = {}) =>
    this.http.request<ISmtpControllerCreateData, any>({
      path: `/smtp`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name SmtpControllerFindAll
   * @request GET:/smtp
   * @response `200` `ISmtpControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<ISmtpControllerFindAllData, any>({
      path: `/smtp`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name SmtpControllerDeleteById
   * @request DELETE:/smtp/{id}
   * @response `200` `ISmtpControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<ISmtpControllerDeleteByIdData, any>({
      path: `/smtp/${id}`,
      method: 'DELETE',
      ...params,
    });
}
