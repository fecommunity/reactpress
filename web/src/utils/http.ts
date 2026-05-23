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

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const base = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  if (!params) return base;
  const url = new URL(base, window.location.origin);
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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = buildUrl(path, options?.params);
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

  if (!res.ok) {
    throw new HttpError(res.status, `HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.code !== undefined && json.code !== 0) {
    throw new ApiError(json.code, json.message ?? "Unknown error");
  }

  if (json.success === false) {
    throw new ApiError(json.statusCode ?? 500, json.msg ?? "Request failed");
  }

  if (json.success === true && "data" in json) {
    return json.data as T;
  }

  return json.data !== undefined ? json.data : json;
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
