export function isApiError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { data?: unknown } }).response?.data,
  );
}

export class ApiError extends Error {
  public code: number;
  public details: unknown;

  constructor(message: string, code: number = 500, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }

  static isInstance(error: unknown): error is ApiError {
    return (
      error instanceof ApiError ||
      Boolean(
        error &&
          typeof error === 'object' &&
          (error as { name?: string; code?: number }).name === 'ApiError' &&
          (error as { code?: number }).code !== undefined,
      )
    );
  }
}
