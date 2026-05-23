import { http } from "msw";
import { MOCK_ARTICLES } from "../data";
import type { MockArticle } from "../data";
import { paginateList, parsePaginationParams } from "../utils";
import { withDelay, successResponse } from "../createHandler";

function filterArticles(
  articles: MockArticle[],
  options: { status?: string; title?: string },
): MockArticle[] {
  let filtered = [...articles];
  if (options.status) {
    filtered = filtered.filter((a) => a.status === options.status);
  }
  if (options.title) {
    filtered = filtered.filter((a) => a.title.includes(options.title!));
  }
  return filtered;
}

export const articleHandlers = [
  http.get("/api/article", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const status = url.searchParams.get("status") ?? "";
    const title = url.searchParams.get("title") ?? "";

    const filtered = filterArticles(MOCK_ARTICLES, {
      status: status || undefined,
      title: title || undefined,
    });
    const list = paginateList(filtered, limit, offset);

    return successResponse([list, filtered.length]);
  }),
];
