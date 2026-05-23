import { http } from "msw";
import { MOCK_USERS } from "../data";
import { withDelay, successResponse, errorResponse, ERROR_CODES } from "../createHandler";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    await withDelay(300);
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    if (body.username === "admin" && body.password === "admin") {
      return successResponse({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    }
    return errorResponse(ERROR_CODES.INVALID_CREDENTIALS, "Invalid username or password");
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
    const { permissions: _permissions, ...userWithoutPermissions } = MOCK_USERS[0]!;
    return successResponse(userWithoutPermissions);
  }),

  http.get("/api/auth/permissions", () => successResponse(MOCK_USERS[0]!.permissions)),
];
