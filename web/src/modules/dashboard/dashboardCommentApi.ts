import {
  type CommentRow,
  type CommentStatusCounts,
  fetchArticleTitleMap,
  fetchCommentStatusCounts,
} from "@/modules/comment/commentListApi";
import { parsePaginated } from "@/shared/api/pagination";
import { getToolkitClient } from "@/shared/client";

export type { CommentStatusCounts };

export async function fetchRecentComments(limit = 8): Promise<CommentRow[]> {
  const api = await getToolkitClient();
  const res = await api.comment.findAll({
    query: { page: 1, pageSize: limit },
  } as Parameters<typeof api.comment.findAll>[0]);
  return parsePaginated<CommentRow>(res).list;
}

export { fetchArticleTitleMap, fetchCommentStatusCounts };
