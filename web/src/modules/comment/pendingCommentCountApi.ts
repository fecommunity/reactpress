import { parsePaginated } from "@/shared/api/pagination";
import { getToolkitClient } from "@/shared/client";

export const PENDING_COMMENT_COUNT_QUERY_KEY = ["comment-pending-count"] as const;

export async function fetchPendingCommentCount(): Promise<number> {
  const api = await getToolkitClient();
  const res = await api.comment.findAll({
    query: { page: 1, pageSize: 1, pass: "0" },
  } as Parameters<typeof api.comment.findAll>[0]);
  return parsePaginated(res).total;
}
