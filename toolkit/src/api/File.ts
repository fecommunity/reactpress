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
  IFileControllerDeleteByIdData,
  IFileControllerFindAllData,
  IFileControllerFindByIdData,
  IFileControllerUploadFileData,
} from '../types';
import { HttpClient, RequestParams } from './HttpClient';

export class File<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags File
   * @name FileControllerUploadFile
   * @request POST:/file/upload
   * @response `200` `IFileControllerUploadFileData` 上传文件
   */
  uploadFile = (params: RequestParams = {}) =>
    this.http.request<IFileControllerUploadFileData, any>({
      path: `/file/upload`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FileControllerFindAll
   * @request GET:/file
   * @response `200` `IFileControllerFindAllData`
   */
  findAll = (params: RequestParams = {}) =>
    this.http.request<IFileControllerFindAllData, any>({
      path: `/file`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FileControllerFindById
   * @request GET:/file/{id}
   * @response `200` `IFileControllerFindByIdData`
   */
  findById = (id: string, params: RequestParams = {}) =>
    this.http.request<IFileControllerFindByIdData, any>({
      path: `/file/${id}`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags File
   * @name FileControllerDeleteById
   * @request DELETE:/file/{id}
   * @response `200` `IFileControllerDeleteByIdData`
   */
  deleteById = (id: string, params: RequestParams = {}) =>
    this.http.request<IFileControllerDeleteByIdData, any>({
      path: `/file/${id}`,
      method: 'DELETE',
      ...params,
    });
}
