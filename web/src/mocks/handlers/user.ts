import { http } from "msw";

import { ERROR_CODES, errorResponse, successResponse, withDelay } from "../createHandler";
import { MOCK_USERS } from "../data";
import { setMockCredential } from "../mockCredentials";
import { filterUsers, paginateList, parsePaginationParams } from "../utils";

type MockUserRow = (typeof MOCK_USERS)[number] & { status: "active" | "locked" };

let users: MockUserRow[] = MOCK_USERS.map((user) => ({ ...user, status: "active" as const }));

function mapMockUserForServer(user: MockUserRow) {
  const role = user.roles[0] ?? "visitor";
  const status = user.status === "locked" ? "locked" : "active";
  return {
    id: user.id,
    name: user.username,
    avatar: user.avatar,
    email: user.email,
    role,
    status,
  };
}

export const userHandlers = [
  http.get("/api/user", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const keyword = url.searchParams.get("keyword") ?? url.searchParams.get("name") ?? "";
    const role = url.searchParams.get("role") ?? "";

    const filtered = filterUsers(users, { keyword, role }) as MockUserRow[];
    const list = paginateList(filtered, limit, offset).map((user) => mapMockUserForServer(user));
    return successResponse([list, filtered.length] as const);
  }),

  http.post("/api/user/register", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const username = String(body.name ?? body.username);
    if (users.some((user) => user.username === username)) {
      return errorResponse(ERROR_CODES.BAD_REQUEST, "Username already exists");
    }
    const role = String(body.role ?? "visitor");
    const password = typeof body.password === "string" ? body.password : username;
    setMockCredential(username, password);
    const newUser = {
      id: String(users.length + 1),
      username,
      avatar: null,
      email: typeof body.email === "string" ? body.email : null,
      roles: [role],
      permissions: [],
      status: "active" as const,
    };
    users.push(newUser);
    return successResponse(mapMockUserForServer(newUser));
  }),

  http.post("/api/user/update", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "User not found");
    }
    const role = body.role ? String(body.role) : users[idx].roles[0];
    const status =
      body.status === "locked" || body.status === "active"
        ? (String(body.status) as "active" | "locked")
        : users[idx].status;
    users[idx] = {
      ...users[idx],
      username: body.name ? String(body.name) : users[idx].username,
      email: typeof body.email === "string" ? body.email : users[idx].email,
      avatar:
        body.avatar === null || body.avatar === ""
          ? null
          : typeof body.avatar === "string"
            ? body.avatar
            : users[idx].avatar,
      roles: body.roles ? (body.roles as string[]) : [role],
      status,
    };
    return successResponse(mapMockUserForServer(users[idx]));
  }),

  http.post("/api/user/password", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "");
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "User not found");
    }
    if (!body.newPassword) {
      return errorResponse(ERROR_CODES.BAD_REQUEST, "New password is required");
    }
    return successResponse(mapMockUserForServer(users[idx]));
  }),

  http.delete("/api/user/:id", async ({ params }) => {
    await withDelay(200);
    users = users.filter((u) => u.id !== params.id);
    return successResponse(null);
  }),
];
