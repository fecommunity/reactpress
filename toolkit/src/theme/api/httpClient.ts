import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { getStoredAccessToken } from '../visitor/authSession';
import { resolveThemeApiBaseUrl } from './api';

export interface ThemeApiEnvelope<T = unknown> {
  statusCode: number;
  success: boolean;
  msg: string | null;
  data: T;
}

export interface CreateThemeAxiosClientOptions {
  baseURL?: string;
  timeout?: number;
  getAccessToken?: () => string | null;
  onError?: (message: string, status?: number) => void;
  onUnauthorized?: () => void;
  unwrapEnvelope?: boolean;
}

/**
 * Theme axios base URL (SSR + client).
 * Do not read `process.env.SERVER_API_URL` here — Next inlines it from next.config at compile time
 * and stale values (e.g. localhost:3002) break `--remote-origin` dev.
 */
export function resolveThemeAxiosBaseUrl(): string {
  return resolveThemeApiBaseUrl();
}

/** Encode dynamic path segments (e.g. Chinese tag names) for Node fetch / axios. */
export function encodeAxiosUrlPath(url: string): string {
  const qIndex = url.indexOf('?');
  const pathname = qIndex === -1 ? url : url.slice(0, qIndex);
  const search = qIndex === -1 ? '' : url.slice(qIndex);

  const encodedPath = pathname
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');

  return encodedPath + search;
}

export function createThemeAxiosClient(options: CreateThemeAxiosClientOptions = {}): AxiosInstance {
  const isBrowser = typeof window !== 'undefined';
  const {
    baseURL = resolveThemeAxiosBaseUrl(),
    timeout = 60000,
    getAccessToken = getStoredAccessToken,
    onError,
    onUnauthorized,
    unwrapEnvelope = true,
  } = options;

  const client = axios.create({ baseURL, timeout });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.url) {
        config.url = encodeAxiosUrlPath(config.url);
      }
      if (isBrowser) {
        const token = getAccessToken();
        if (config.headers && token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    () => {
      throw new Error('Failed to send request');
    },
  );

  client.interceptors.response.use(
    (response: AxiosResponse<ThemeApiEnvelope>) => {
      if (!unwrapEnvelope) {
        return response;
      }

      const payload = response.data;
      if (!payload?.success) {
        onError?.(payload?.msg || 'Request failed');
      const message = payload?.msg || `Request failed (${payload?.statusCode ?? 'unknown'})`;
      return Promise.reject(new Error(message));
      }
      return payload.data as never;
    },
    (err) => {
      const status = err?.response?.status as number | undefined;
      const msg = err?.response?.data?.msg as string | undefined;

      if (status === 401) {
        onUnauthorized?.();
        onError?.(msg || 'Unauthorized');
      } else if (status) {
        onError?.(msg || 'Server error', status);
      }

      const message = msg || err?.message || `HTTP ${status ?? 'error'}`;
      return Promise.reject(new Error(message));
    },
  );

  return client;
}
