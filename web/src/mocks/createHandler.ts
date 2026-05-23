import { HttpResponse, delay as mswDelay } from "msw";

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * MSW handler factory functions
 * Provides consistent response wrapping and error handling
 */

/**
 * Wrap a handler function with standard response format
 * Automatically handles delay, error responses, and data wrapping
 */
export async function withDelay(ms: number = 200): Promise<void> {
  await mswDelay(ms);
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message: string = "ok") {
  return HttpResponse.json({
    code: 0,
    data,
    message,
  });
}

/**
 * Create an error response
 */
export function errorResponse(code: number, message: string, data: unknown = null) {
  return HttpResponse.json({
    code,
    data,
    message,
  });
}

/**
 * Predefined error codes
 */
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 1001,
  NOT_FOUND: 1002,
  UNAUTHORIZED: 1003,
  FORBIDDEN: 1004,
  BAD_REQUEST: 1005,
  INTERNAL_ERROR: 1006,
} as const;
