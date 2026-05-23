import type { CreateUserRequest, UpdateUserRequest, User } from "./schemas";

/** Paths are relative to {@link API_BASE_URL} (which already includes `/api`). */
export const USER_ENDPOINTS = {
  list: "/user",
  create: "/user/register",
  update: (_id: string) => "/user/update",
  delete: (id: string) => `/user/${id}`,
} as const;

export type { CreateUserRequest, UpdateUserRequest, User };
