import { ERROR_CODES } from "@/mocks/createHandler";
import { AdminAccessDeniedError } from "@/shared/auth/adminAccess";
import { extractApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { ApiError, HttpError } from "@/utils/http";

type Translate = (key: string) => string;

function isLikelyInvalidCredentials(err: unknown, message: string): boolean {
  if (err instanceof ApiError && err.code === ERROR_CODES.INVALID_CREDENTIALS) {
    return true;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes("invalid username or password") ||
    lower.includes("invalid credentials") ||
    lower.includes("incorrect username or password")
  );
}

function isTooManyLoginAttempts(err: unknown, message: string): boolean {
  if (err instanceof HttpError && err.status === 429) {
    return true;
  }
  if (err instanceof ApiError && err.code === 429) {
    return true;
  }

  const lower = message.toLowerCase();
  return lower.includes("too many login attempts") || lower.includes("登录尝试次数过多");
}

function isAdminAccessDenied(err: unknown, message: string): boolean {
  if (err instanceof AdminAccessDeniedError) {
    return true;
  }
  if (err instanceof ApiError && err.code === ERROR_CODES.ADMIN_ACCESS_DENIED) {
    return true;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes("contact an administrator") ||
    lower.includes("联系管理员") ||
    lower.includes("administrator for access")
  );
}

export function getLoginErrorMessage(err: unknown, t: Translate): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return t("login.apiConnectionError");
  }

  const serverMessage = extractApiErrorMessage(err);
  if (serverMessage) {
    if (isTooManyLoginAttempts(err, serverMessage)) {
      return t("login.tooManyAttempts");
    }
    if (isAdminAccessDenied(err, serverMessage)) {
      return t("login.adminAccessRequired");
    }
    if (isLikelyInvalidCredentials(err, serverMessage)) {
      return t("login.invalidCredentials");
    }
    return serverMessage;
  }

  return t("login.failed");
}
