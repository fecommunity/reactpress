import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/plugin/react";

const DEFAULT_API_BASE = "/api";

export interface ImageOptimizeReport {
  total: number;
  alreadyOptimized: number;
  needsOptimization: number;
  skipped: {
    nonImage: number;
    svg: number;
    gif: number;
    missing: number;
  };
  storageBytes: {
    current: number;
    estimatedAfter: number;
    estimatedSaved: number;
  };
  contentRefs: {
    articles: number;
    pages: number;
  };
}

export interface OptimizeRunOptions {
  dryRun?: boolean;
  batchSize?: number;
  skipGif?: boolean;
  rewriteContent?: boolean;
  cleanupOriginals?: boolean;
  limit?: number;
}

export interface OptimizeJobItemResult {
  fileId: string;
  originalname: string;
  status: "success" | "skipped" | "failed";
  oldUrl?: string;
  newUrl?: string;
  savedBytes?: number;
  error?: string;
}

export interface OptimizeJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  dryRun: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  savedBytes: number;
  urlMap: Record<string, string>;
  items: OptimizeJobItemResult[];
  rewriteContent: boolean;
  contentRewrite?: {
    articles: number;
    pages: number;
    revisions: number;
  };
  error?: string;
  startedAt: string;
  finishedAt?: string;
}

function readAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { tokens?: { accessToken?: string } } };
    return parsed.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

function readApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

async function optimizeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (await resolveApiBaseUrl(DEFAULT_API_BASE)).replace(/\/$/, "");
  const token = readAccessToken();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json()) as {
    success?: boolean;
    code?: number;
    data?: T;
    msg?: string;
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!res.ok) {
    throw new Error(body.msg ?? body.message ?? `Request failed: ${res.status}`);
  }
  if (typeof body.code === "number" && body.code !== 0) {
    throw new Error(body.message ?? "Request failed");
  }
  if (body.success === false) {
    throw new Error(body.msg ?? "Request failed");
  }
  return body.data as T;
}

export function fetchOptimizeReport() {
  return optimizeFetch<ImageOptimizeReport>("/file/optimize/report");
}

export function startOptimizeJob(options: OptimizeRunOptions) {
  return optimizeFetch<OptimizeJob>("/file/optimize/run", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export function fetchOptimizeJob(jobId: string) {
  return optimizeFetch<OptimizeJob>(`/file/optimize/job/${encodeURIComponent(jobId)}`);
}

export { readApiErrorMessage };
