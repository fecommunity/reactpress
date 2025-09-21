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
  deleteByIdData,
  findAllData,
  findByIdData,
  uploadFileData,
} from '../types/data-contracts';
import { HttpClient, RequestParams } from './HttpClient';

export class File<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags File
   * @name uploadFile
   * @request POST:/file/upload
   * @response `200` `uploadFileData` 上传文件
   */
  uploadFile = (params: RequestParams = {}) =>
    this.request<uploadFileData, any>({
      path: `/file/upload`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name findAll
   * @request GET:/file
   * @response `200` `findAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.request<findAllData, any>({
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
   * @response `200` `findByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.request<findByIdData, any>({
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
   * @response `200` `deleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.request<deleteByIdData, any>({
      path: `/file/${id}`,
      method: 'DELETE',
      ...params,
    });
}
