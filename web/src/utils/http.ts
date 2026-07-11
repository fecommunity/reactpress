import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/plugin/react";

import { API_BASE_URL } from "./constants";

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  params?: Record<string, string | number | null | undefined>;
};

async function getResolvedApiBaseUrl(): Promise<string> {
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  return base.replace(/\/$/, "");
}

async function buildUrl(path: string, params?: RequestOptions["params"]): Promise<string> {
  let base: string;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    base = path;
  } else {
    const apiBase = await getResolvedApiBaseUrl();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    base = `${apiBase}${normalizedPath}`;
  }
  if (!params) return base;
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.tokens?.accessToken;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // noop
  }
  return {};
}

function readApiMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => readApiMessage(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(", ") : null;
  }

  if (value && typeof value === "object") {
    const payload = value as Record<string, unknown>;
    return readApiMessage(payload.message) ?? readApiMessage(payload.msg);
  }

  return null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = await buildUrl(path, options?.params);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    if (json && typeof json === "object") {
      const payload = json as Record<string, unknown>;
      if (typeof payload.code === "number" && payload.code !== 0) {
        throw new ApiError(payload.code, readApiMessage(payload.message) ?? "Unknown error");
      }
      const msg = readApiMessage(payload.msg) ?? readApiMessage(payload.message);
      if (msg) {
        throw new ApiError(Number(payload.statusCode ?? res.status), msg);
      }
    }
    throw new HttpError(res.status, `HTTP ${res.status}: ${res.statusText}`);
  }

  if (json && typeof json === "object") {
    const payload = json as Record<string, unknown>;

    if (payload.code !== undefined && payload.code !== 0) {
      throw new ApiError(Number(payload.code), readApiMessage(payload.message) ?? "Unknown error");
    }

    if (payload.success === false) {
      throw new ApiError(
        Number(payload.statusCode ?? 500),
        readApiMessage(payload.msg) ?? "Request failed",
      );
    }

    if (payload.success === true && "data" in payload) {
      return payload.data as T;
    }

    return payload.data !== undefined ? (payload.data as T) : (json as T);
  }

  return json as T;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
