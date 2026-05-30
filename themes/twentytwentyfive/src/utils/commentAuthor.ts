export const COMMENT_AUTHOR_STORAGE_KEY = 'reactpress-comment-author';

export type CommentAuthor = {
  name: string;
  email: string;
};

/** Permissive enough for common guest comment emails (qq/163/gmail, subdomains). */
export const COMMENT_EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidCommentEmail(email: string | undefined | null): boolean {
  return Boolean(email?.trim() && COMMENT_EMAIL_REGEXP.test(email.trim()));
}

export function isValidCommentAuthor(author: Partial<CommentAuthor> | null | undefined): author is CommentAuthor {
  return Boolean(author?.name?.trim() && isValidCommentEmail(author.email));
}

export function getCommentEmailError(
  email: string | undefined | null,
  messages: { required: string; invalid: string },
  options: { touched?: boolean } = {},
): string {
  const trimmed = email?.trim() ?? '';
  if (!options.touched) return '';
  if (!trimmed) return messages.required;
  if (!isValidCommentEmail(trimmed)) return messages.invalid;
  return '';
}

export function readCommentAuthor(): CommentAuthor | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COMMENT_AUTHOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommentAuthor>;
    if (!isValidCommentAuthor(parsed)) return null;
    return { name: parsed.name.trim(), email: parsed.email.trim() };
  } catch {
    return null;
  }
}

export function persistCommentAuthor(author: CommentAuthor): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    COMMENT_AUTHOR_STORAGE_KEY,
    JSON.stringify({ name: author.name.trim(), email: author.email.trim() }),
  );
}
