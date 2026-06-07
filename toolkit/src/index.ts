// Public subpath modules: api, types, ui, utils, theme, plugin, config

export * as config from './config';
export * as plugin from './plugin';
export * as theme from './theme';
export * as types from './types';
export * as ui from './ui';
export * as utils from './utils';

/** @deprecated Prefer `@fecommunity/reactpress-toolkit/api` subpath imports. */
export { api, createApiInstance, http as httpInstance } from './api/instance';
export * from './config';
export * from './types';
export * from './utils';

import { createApiInstance, http as httpInstance } from './api/instance';

/** @deprecated Prefer `createApiInstance` from `@fecommunity/reactpress-toolkit/api/instance`. */
export const http = {
  ...httpInstance,
  createApiInstance,
};
