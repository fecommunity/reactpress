import type { User } from "@/api/schemas";

export class AdminAccessDeniedError extends Error {
  constructor() {
    super("admin access denied");
    this.name = "AdminAccessDeniedError";
  }
}

export function hasAdminConsoleAccess(user: Pick<User, "roles"> | null | undefined): boolean {
  return user?.roles?.includes("admin") ?? false;
}

export function assertAdminConsoleAccess(user: Pick<User, "roles"> | null | undefined): void {
  if (!hasAdminConsoleAccess(user)) {
    throw new AdminAccessDeniedError();
  }
}
