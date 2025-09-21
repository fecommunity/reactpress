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
  IAuthControllerCreateBookData,
  IAuthControllerLoginData,
  IAuthControllerLoginWithGithubData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class Auth<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLogin
   * @request POST:/auth/login
   * @response `200` `IAuthControllerLoginData`
   */
  login = (params: RequestParams = {}) =>
    this.http.request<IAuthControllerLoginData, any>({
      path: `/auth/login`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerCreateBook
   * @request POST:/auth/admin
   * @response `201` `IAuthControllerCreateBookData`
   */
  createBook = (params: RequestParams = {}) =>
    this.http.request<IAuthControllerCreateBookData, any>({
      path: `/auth/admin`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLoginWithGithub
   * @request POST:/auth/github
   * @response `201` `IAuthControllerLoginWithGithubData`
   */
  loginWithGithub = (params: RequestParams = {}) =>
    this.http.request<IAuthControllerLoginWithGithubData, any>({
      path: `/auth/github`,
      method: 'POST',
      ...params,
    });
}
