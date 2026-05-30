import { ERROR_CODES } from "@/mocks/createHandler";
import { extractApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { ApiError } from "@/utils/http";

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

export function getLoginErrorMessage(err: unknown, t: Translate): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return t("login.apiConnectionError");
  }

  const serverMessage = extractApiErrorMessage(err);
  if (serverMessage) {
    if (isLikelyInvalidCredentials(err, serverMessage)) {
      return t("login.invalidCredentials");
    }
    return serverMessage;
  }

  return t("login.failed");
}
