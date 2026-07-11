import { http } from "msw";

import { ERROR_CODES, errorResponse, successResponse, withDelay } from "../createHandler";
import { MOCK_USERS } from "../data";
import { getMockSessionUsername, setMockSessionUsername } from "../mockSession";
import { verifyMockCredential } from "../mockCredentials";
import { findMockUserByUsername } from "./user";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    await withDelay(300);
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    const valid =
      (body.username === "admin" && body.password === "admin") ||
      verifyMockCredential(body.username, body.password);
    if (!valid) {
      return errorResponse(ERROR_CODES.INVALID_CREDENTIALS, "Invalid username or password");
    }

    const user = findMockUserByUsername(body.username);
    if (!user || !user.roles.includes("admin")) {
      return errorResponse(
        ERROR_CODES.ADMIN_ACCESS_DENIED,
        "Please contact an administrator for access authorization",
      );
    }

    setMockSessionUsername(body.username);
    return successResponse({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
  }),

  http.post("/api/auth/refresh", async () => {
    await withDelay(100);
    return successResponse({
      accessToken: "mock-new-access-token",
      refreshToken: "mock-new-refresh-token",
    });
  }),

  http.post("/api/auth/logout", () => successResponse(null)),

  http.get("/api/auth/user", () => {
    const username = getMockSessionUsername();
    const user = username ? findMockUserByUsername(username) : MOCK_USERS[0];
    if (!user) {
      const { permissions: _permissions, ...userWithoutPermissions } = MOCK_USERS[0]!;
      return successResponse(userWithoutPermissions);
    }
    const { permissions: _permissions, ...userWithoutPermissions } = user;
    return successResponse(userWithoutPermissions);
  }),

  http.get("/api/auth/permissions", () => {
    const username = getMockSessionUsername();
    const user = username ? findMockUserByUsername(username) : MOCK_USERS[0];
    return successResponse(user?.permissions ?? MOCK_USERS[0]!.permissions);
  }),
];
