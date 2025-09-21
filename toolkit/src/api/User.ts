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

import {
  findAllData,
  registerData,
  updateData,
  updatePasswordData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class User<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags User
   * @name findAll
   * @request GET:/user
   * @response `200` `findAllData` 获取用户列表
   * @response `403` `void` 无权获取用户列表
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, void>({
      path: `/user`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name register
   * @request POST:/user/register
   * @response `201` `registerData` 创建用户
   */
  register = (params: RequestParams = {}) =>
    this.request<registerData, any>({
      path: `/user/register`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name update
   * @request POST:/user/update
   * @response `200` `updateData` 更新用户成功
   */
  update = (params: RequestParams = {}) =>
    this.request<updateData, any>({
      path: `/user/update`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name updatePassword
   * @request POST:/user/password
   * @response `201` `updatePasswordData` 更新密码成功
   */
  updatePassword = (params: RequestParams = {}) =>
    this.request<updatePasswordData, any>({
      path: `/user/password`,
      method: 'POST',
      ...params,
    });
}
