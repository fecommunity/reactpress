// Automatically generated API toolkit for ReactPress
// Do not manually modify this file
// Generated at: 9/25/2025, 9:47:27 PM

import { api, createApiInstance,http as httpInstance } from './api/instance';
import * as config from './config';
import * as types from './types';
import * as utils from './utils';

const http = {
  ...httpInstance,
  createApiInstance,
};

export { api, config, http,types, utils };
export * as admin from './admin';
export * as react from './react';
export { createClient, getDefaultApiBaseUrl } from './react/client';
