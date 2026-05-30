import type { AuthTokens, LoginRequest, MenuItem, PermissionsList, User } from "./schemas";

/** Paths are relative to {@link API_BASE_URL} (which already includes `/api`). */
export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  user: "/auth/user",
  permissions: "/auth/permissions",
} as const;

export type { AuthTokens, LoginRequest, MenuItem, PermissionsList, User };
