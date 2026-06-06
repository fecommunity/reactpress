export const FEED_PAGE_SIZE = 12;

export type FeedFooterPlacementOptions = {
  hasMore?: boolean;
  itemCount?: number;
  pageSize?: number;
};

/** 内容足够多、需要滚动加载时 footer 放右侧栏；否则放页面底部。 */
export function shouldPlaceFooterInSidebar({
  hasMore = false,
  itemCount = 0,
  pageSize = FEED_PAGE_SIZE,
}: FeedFooterPlacementOptions = {}): boolean {
  return hasMore || itemCount >= pageSize;
}
