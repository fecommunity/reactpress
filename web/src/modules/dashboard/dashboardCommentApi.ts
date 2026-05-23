import {
  fetchArticleTitleMap,
  fetchCommentStatusCounts,
  type CommentRow,
  type CommentStatusCounts,
} from "@/modules/comment/commentListApi";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";

export type { CommentStatusCounts };

export async function fetchRecentComments(limit = 8): Promise<CommentRow[]> {
  const api = await getToolkitClient();
  const res = await api.comment.findAll({
    query: { page: 1, pageSize: limit },
  } as Parameters<typeof api.comment.findAll>[0]);
  return parsePaginated<CommentRow>(res).list;
}

export { fetchCommentStatusCounts, fetchArticleTitleMap };
