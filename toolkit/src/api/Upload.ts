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
import { HttpClient, RequestParams } from './http-client';

export class Upload<SecurityDataType = unknown> {
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
   * @response `200` `(IFile)[]` 上传文件
   */
  fileControllerUploadFile = (params: RequestParams = {}) =>
    this.http.request<IFile[], any>({
      path: `/file/upload`,
      method: 'POST',
      format: 'json',
      ...params,
    });
}
