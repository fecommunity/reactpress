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

import { IUser } from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class User<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags User
   * @name findAll
   * @request GET:/user
   */
  findAll = (params: RequestParams = {}) =>
    this.request<IUser[], void>({
      path: `/user`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name register
   * @request POST:/user/register
   */
  register = (params: RequestParams = {}) =>
    this.request<IUser[], any>({
      path: `/user/register`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name update
   * @request POST:/user/update
   */
  update = (params: RequestParams = {}) =>
    this.request<IUser[], any>({
      path: `/user/update`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name updatePassword
   * @request POST:/user/password
   */
  updatePassword = (params: RequestParams = {}) =>
    this.request<IUser[], any>({
      path: `/user/password`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
