/** Nest TransformInterceptor body (axios already returns this as `response.data`). */
export interface ApiEnvelope<T = unknown> {
  statusCode?: number;
  msg?: string | null;
  success?: boolean;
  data?: T;
}

/** Paginated endpoints: `data` is `[items, total]`. */
export function unpackPaginated<T>(
  res: ApiEnvelope<[T[], number]> | null | undefined,
): T[] {
  const payload = res?.data;
  if (Array.isArray(payload) && Array.isArray(payload[0])) {
    return payload[0];
  }
  return [];
}

/** List or single entity wrapped in `data`. */
export function unpackList<T>(res: ApiEnvelope<T[]> | null | undefined): T[] {
  const data = res?.data;
  return Array.isArray(data) ? data : [];
}

export function unpackOne<T>(res: ApiEnvelope<T> | null | undefined): T | null {
  const data = res?.data;
  return data != null ? data : null;
}
