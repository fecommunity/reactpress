import { createApiInstance } from '../api/instance';
import type { HttpClient } from '../api/HttpClient';

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export interface ClientOptions {
  baseURL?: string;
  getAccessToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
}

export type ReactPressClient = ReturnType<typeof createApiInstance>;

function attachInterceptors(http: HttpClient, options: ClientOptions) {
  http.instance.interceptors.request.use((config) => {
    const token = options.getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  http.instance.interceptors.response.use(
    (response) => {
      const body = response.data as Record<string, unknown> | null;
      if (!body || typeof body !== 'object') return response;

      if (typeof body.code === 'number') {
        if (body.code !== 0) {
          throw new ApiError(body.code as number, String(body.message ?? 'Request failed'));
        }
        response.data = body.data;
        return response;
      }

      if (typeof body.success === 'boolean') {
        if (!body.success) {
          throw new ApiError(
            Number(body.statusCode ?? 500),
            String(body.msg ?? 'Request failed'),
          );
        }
        response.data = body.data;
        return response;
      }

      return response;
    },
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        options.onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );
}

/** Single factory for web / theme / plugins — wraps generated API modules. */
export function createClient(options: ClientOptions = {}): ReactPressClient {
  const baseURL = options.baseURL ?? 'http://localhost:3002/api';
  const client = createApiInstance({ baseURL });
  attachInterceptors(client.article.http, options);
  return client;
}

export function getDefaultApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.SERVER_API_URL) {
    return process.env.SERVER_API_URL;
  }
  return 'http://localhost:3002/api';
}
