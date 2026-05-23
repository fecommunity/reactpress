import { useQuery } from "@tanstack/react-query";
import {
  fetchPendingCommentCount,
  PENDING_COMMENT_COUNT_QUERY_KEY,
} from "@/modules/comment/pendingCommentCountApi";

export function usePendingCommentCount(enabled = true) {
  return useQuery({
    queryKey: PENDING_COMMENT_COUNT_QUERY_KEY,
    queryFn: fetchPendingCommentCount,
    staleTime: 30_000,
    enabled,
  });
}
