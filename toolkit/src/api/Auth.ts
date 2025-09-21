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
  createBookData,
  loginData,
  loginWithGithubData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Auth
   * @name login
   * @request POST:/auth/login
   * @response `200` `loginData`
   */
  login = (params: RequestParams = {}) =>
    this.request<loginData, any>({
      path: `/auth/login`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name createBook
   * @request POST:/auth/admin
   * @response `201` `createBookData`
   */
  createBook = (params: RequestParams = {}) =>
    this.request<createBookData, any>({
      path: `/auth/admin`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name loginWithGithub
   * @request POST:/auth/github
   * @response `201` `loginWithGithubData`
   */
  loginWithGithub = (params: RequestParams = {}) =>
    this.request<loginWithGithubData, any>({
      path: `/auth/github`,
      method: 'POST',
      ...params,
    });
}
