/** Permissive enough for common guest comment emails (qq/163/gmail, subdomains). */
export const COMMENT_EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidCommentEmail(email: string | undefined | null): boolean {
  return Boolean(email?.trim() && COMMENT_EMAIL_REGEXP.test(email.trim()));
}
