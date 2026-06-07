import {
  COMMENT_EMAIL_REGEXP,
  isValidCommentEmail,
} from '../../utils/email';

export const COMMENT_AUTHOR_STORAGE_KEY = 'reactpress-comment-author';

export type CommentAuthor = {
  name: string;
  email: string;
};

export { COMMENT_EMAIL_REGEXP, isValidCommentEmail };

export function isValidCommentAuthor(
  author: Partial<CommentAuthor> | null | undefined,
): author is CommentAuthor {
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
