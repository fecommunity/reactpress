import { ApiError as ToolkitApiError } from "@fecommunity/reactpress-toolkit/plugin/react";
import type { MessageInstance } from "antd/es/message/interface";

import { ApiError, HttpError } from "@/utils/http";

type Translate = (key: string) => string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readApiMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => readApiMessage(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(", ") : null;
  }

  if (isRecord(value)) {
    return readApiMessage(value.message) ?? readApiMessage(value.msg);
  }

  return null;
}

function readResponseBodyMessage(err: unknown): string | null {
  if (!isRecord(err) || !isRecord(err.response) || !isRecord(err.response.data)) {
    return null;
  }

  const data = err.response.data;
  return readApiMessage(data.msg) ?? readApiMessage(data.message);
}

function readErrorMessage(err: unknown): string | null {
  if (err instanceof ApiError || err instanceof ToolkitApiError) {
    return readApiMessage(err.message);
  }

  if (err instanceof Error && err.name === "ApiError") {
    return readApiMessage(err.message);
  }

  if (err instanceof HttpError) {
    const message = readApiMessage(err.message);
    if (message && !/^HTTP \d+:/.test(message)) {
      return message;
    }
    return null;
  }

  const responseMessage = readResponseBodyMessage(err);
  if (responseMessage) return responseMessage;

  if (err instanceof Error) {
    const message = readApiMessage(err.message);
    if (
      message &&
      !/^HTTP \d+:/.test(message) &&
      !/^Request failed with status code \d+$/.test(message)
    ) {
      return message;
    }
  }

  return null;
}

/** Returns a server-provided message when available; otherwise null. */
export function extractApiErrorMessage(err: unknown): string | null {
  return readErrorMessage(err);
}

export function getApiErrorMessage(
  err: unknown,
  t: Translate,
  fallbackKey: string,
  options?: { connectionErrorKey?: string },
): string {
  const connectionErrorKey = options?.connectionErrorKey ?? "login.apiConnectionError";

  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return t(connectionErrorKey);
  }

  const message = readErrorMessage(err);
  if (message) return message;

  return t(fallbackKey);
}

export function showApiErrorToast(
  messageApi: MessageInstance,
  err: unknown,
  t: Translate,
  fallbackKey: string,
  duration = 4,
): void {
  messageApi.error(getApiErrorMessage(err, t, fallbackKey), duration);
}
