import type { CreateUserRequest, UpdateUserRequest, User } from "./schemas";

/** Paths are relative to {@link API_BASE_URL} (which already includes `/api`). */
export const USER_ENDPOINTS = {
  list: "/users",
  create: "/users",
  update: (id: string) => `/users/${id}`,
  delete: (id: string) => `/users/${id}`,
} as const;

export type { CreateUserRequest, UpdateUserRequest, User };
