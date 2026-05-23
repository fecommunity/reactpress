import { http } from "msw";
import { MOCK_COMMENTS } from "../data";
import type { MockComment } from "../data";
import { paginateList, parsePaginationParams } from "../utils";
import { withDelay, successResponse, errorResponse, ERROR_CODES } from "../createHandler";

let comments = [...MOCK_COMMENTS];

function filterComments(
  list: MockComment[],
  options: { pass?: string; name?: string; email?: string },
): MockComment[] {
  let filtered = [...list];
  if (options.pass !== undefined && options.pass !== "") {
    const passVal = options.pass === "1" || options.pass === "true";
    filtered = filtered.filter((c) => c.pass === passVal);
  }
  if (options.name) {
    filtered = filtered.filter((c) => c.name.includes(options.name!));
  }
  if (options.email) {
    filtered = filtered.filter((c) => c.email.includes(options.email!));
  }
  return filtered;
}

export const commentHandlers = [
  http.get("/api/comment", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const pass = url.searchParams.get("pass") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";

    const filtered = filterComments(comments, {
      pass: pass || undefined,
      name: name || undefined,
      email: email || undefined,
    });
    const list = paginateList(filtered, limit, offset);

    return successResponse([list, filtered.length]);
  }),

  http.patch("/api/comment/:id", async ({ params, request }) => {
    await withDelay(200);
    const body = (await request.json()) as Partial<MockComment>;
    const idx = comments.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Comment not found");
    }
    comments[idx] = { ...comments[idx], ...body };
    return successResponse(comments[idx]);
  }),

  http.delete("/api/comment/:id", async ({ params }) => {
    await withDelay(200);
    const exists = comments.some((c) => c.id === params.id);
    if (!exists) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Comment not found");
    }
    comments = comments.filter((c) => c.id !== params.id);
    return successResponse(null);
  }),
];
