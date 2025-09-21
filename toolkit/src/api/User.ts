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
  IUserControllerFindAllData,
  IUserControllerRegisterData,
  IUserControllerUpdateData,
  IUserControllerUpdatePasswordData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class User<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags User
   * @name UserControllerFindAll
   * @request GET:/user
   * @response `200` `IUserControllerFindAllData` 获取用户列表
   * @response `403` `void` 无权获取用户列表
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IUserControllerFindAllData, void>({
      path: `/user`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerRegister
   * @request POST:/user/register
   * @response `201` `IUserControllerRegisterData` 创建用户
   */
  register = (params: RequestParams = {}) =>
    this.http.request<IUserControllerRegisterData, any>({
      path: `/user/register`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerUpdate
   * @request POST:/user/update
   * @response `200` `IUserControllerUpdateData` 更新用户成功
   */
  update = (params: RequestParams = {}) =>
    this.http.request<IUserControllerUpdateData, any>({
      path: `/user/update`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags User
   * @name UserControllerUpdatePassword
   * @request POST:/user/password
   * @response `201` `IUserControllerUpdatePasswordData` 更新密码成功
   */
  updatePassword = (params: RequestParams = {}) =>
    this.http.request<IUserControllerUpdatePasswordData, any>({
      path: `/user/password`,
      method: 'POST',
      ...params,
    });
}
