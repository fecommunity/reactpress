import type { HttpClient } from '../../api/HttpClient';
import { createApiInstance } from '../../api/instance';

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

function readApiMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => readApiMessage(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(', ') : null;
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    return readApiMessage(payload.message) ?? readApiMessage(payload.msg);
  }

  return null;
}

function rejectApiError(status: number | undefined, payload: Record<string, unknown>) {
  if (typeof payload.code === 'number' && payload.code !== 0) {
    return Promise.reject(
      new ApiError(payload.code, readApiMessage(payload.message) ?? 'Request failed'),
    );
  }

  const message = readApiMessage(payload.msg) ?? readApiMessage(payload.message);
  if (message) {
    return Promise.reject(new ApiError(Number(payload.statusCode ?? status ?? 500), message));
  }

  return null;
}

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
          throw new ApiError(
            body.code as number,
            readApiMessage(body.message) ?? 'Request failed',
          );
        }
        response.data = body.data;
        return response;
      }

      if (typeof body.success === 'boolean') {
        if (!body.success) {
          throw new ApiError(
            Number(body.statusCode ?? 500),
            readApiMessage(body.msg) ?? 'Request failed',
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

      const body = error?.response?.data;
      if (body && typeof body === 'object') {
        const rejected = rejectApiError(status, body as Record<string, unknown>);
        if (rejected) return rejected;
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
