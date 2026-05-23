/** Toolkit / Nest list endpoints return `[rows, total]`. */
export function parsePaginated<T>(payload: unknown): { list: T[]; total: number } {
  if (Array.isArray(payload) && payload.length >= 2) {
    const [list, total] = payload;
    return {
      list: Array.isArray(list) ? (list as T[]) : [],
      total: typeof total === "number" ? total : Number(total) || 0,
    };
  }
  if (payload && typeof payload === "object" && "list" in payload) {
    const obj = payload as { list?: T[]; total?: number };
    return { list: obj.list ?? [], total: obj.total ?? 0 };
  }
  return { list: [], total: 0 };
}
