
// Utility functions for ReactPress Toolkit

/**
 * Format a date to the specified format
 * @param date - Date to format
 * @param format - Format string (default: YYYY-MM-DD)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if an error is an API error
 * @param error - Error to check
 * @returns True if it's an API error
 */
export function isApiError(error: any): boolean {
  return error && error.response && error.response.data;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  public code: number;
  public details: any;

  constructor(message: string, code: number = 500, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }

  /**
   * Check if an object is an instance of ApiError
   * @param error - Error to check
   * @returns True if it's an ApiError instance
   */
  static isInstance(error: any): error is ApiError {
    return error instanceof ApiError || 
           (error && error.name === 'ApiError' && error.code !== undefined);
  }
}
