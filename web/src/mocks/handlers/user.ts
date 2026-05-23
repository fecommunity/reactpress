import { http } from "msw";
import { MOCK_USERS } from "../data";
import { filterUsers, paginateList, parsePaginationParams } from "../utils";
import { withDelay, successResponse, errorResponse, ERROR_CODES } from "../createHandler";

let users = [...MOCK_USERS];

export const userHandlers = [
  http.get("/api/users", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const keyword = url.searchParams.get("keyword") ?? "";
    const role = url.searchParams.get("role") ?? "";

    const filtered = filterUsers(users, { keyword, role });
    const list = paginateList(filtered, limit, offset);

    return successResponse({ list, total: filtered.length });
  }),

  http.post("/api/users", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const newUser = {
      id: String(users.length + 1),
      username: String(body.username),
      avatar: null,
      email: typeof body.email === "string" ? body.email : null,
      roles: (body.roles as string[]) ?? [],
      permissions: [],
    };
    users.push(newUser);
    return successResponse(newUser);
  }),

  http.put("/api/users/:id", async ({ params, request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "User not found");
    }
    users[idx] = { ...users[idx], ...body };
    return successResponse(users[idx]);
  }),

  http.delete("/api/users/:id", async ({ params }) => {
    await withDelay(200);
    users = users.filter((u) => u.id !== params.id);
    return successResponse(null);
  }),
];
