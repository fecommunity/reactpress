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

import { IFile } from '../types/data-contracts';
import { HttpClient, RequestParams } from './httpClient';

export class File<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags File
   * @name FileControllerUploadFile
   * @request POST:/file/upload
   */
  fileControllerUploadFile = (params: RequestParams = {}) =>
    this.request<IFile[], any>({
      path: `/file/upload`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name findAll
   * @request GET:/file
   */
  findAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name findById
   * @request GET:/file/{id}
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name deleteById
   * @request DELETE:/file/{id}
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file/${id}`,
      method: 'DELETE',
      ...params,
    });
}
