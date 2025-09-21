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
   * @name UserfindAll
   * @request GET:/user
   */
  userfindAll = (params: RequestParams = {}) =>
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
   * @name Userregister
   * @request POST:/user/register
   */
  userregister = (params: RequestParams = {}) =>
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
   * @name Userupdate
   * @request POST:/user/update
   */
  userupdate = (params: RequestParams = {}) =>
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
   * @name UserupdatePassword
   * @request POST:/user/password
   */
  userupdatePassword = (params: RequestParams = {}) =>
    this.request<IUser[], any>({
      path: `/user/password`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
