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

import { createData, deleteByIdData, findAllData } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Smtp<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Smtp
   * @name create
   * @request POST:/smtp
   * @response `200` `createData` 发送邮件
   */
  create = (params: RequestParams = {}) =>
    this.request<createData, any>({
      path: `/smtp`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Smtp
   * @name findAll
   * @request GET:/smtp
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
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
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/smtp/${id}`,
      method: 'DELETE',
      ...params,
    });
}
