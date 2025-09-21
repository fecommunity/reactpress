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
import { HttpClient, RequestParams } from './HttpClient';

export class File<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags File
   * @name FileuploadFile
   * @request POST:/file/upload
   */
  fileuploadFile = (params: RequestParams = {}) =>
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
   * @name FilefindAll
   * @request GET:/file
   */
  filefindAll = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FilefindById
   * @request GET:/file/{id}
   */
  filefindById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FiledeleteById
   * @request DELETE:/file/{id}
   */
  filedeleteById = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/file/${id}`,
      method: 'DELETE',
      ...params,
    });
}
