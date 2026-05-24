import { ERROR_CODES } from "@/mocks/createHandler";
import { ApiError, HttpError } from "@/utils/http";

type Translate = (key: string) => string;

function getHttpStatus(err: unknown): number | undefined {
  if (err instanceof HttpError) return err.status;
  if (typeof err === "object" && err !== null) {
    const candidate = err as { status?: number; response?: { status?: number } };
    return candidate.response?.status ?? candidate.status;
  }
  return undefined;
}

function isInvalidCredentialsError(err: unknown): boolean {
  if (err instanceof ApiError && err.code === ERROR_CODES.INVALID_CREDENTIALS) {
    return true;
  }

  const status = getHttpStatus(err);
  if (status === 400 || status === 401) {
    return true;
  }

  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    return (
      message.includes("invalid username or password") ||
      message.includes("status code 400") ||
      message.includes("status code 401")
    );
  }

  return false;
}

export function getLoginErrorMessage(err: unknown, t: Translate): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return t("login.apiConnectionError");
  }

  if (isInvalidCredentialsError(err)) {
    return t("login.invalidCredentials");
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return t("login.failed");
}
