'use client';

import CommentEmoji from '@/components/comment/CommentEmoji';
import { CommentProvider } from '@/lib/providers/client';
import { getRandomColor, isLoggedInUser, type CommentNode } from '@/lib/utils/comment';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import {
  getCommentEmailError,
  isValidCommentEmail,
  persistCommentAuthor,
  readCommentAuthor,
  resolveImageUrl,
  useAsyncLoading,
  useSiteUser,
  type CommentAuthor,
} from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface CommentEditorProps {
  hostId: string;
  parentComment?: CommentNode;
  replyComment?: CommentNode;
  small?: boolean;
  onOk?: () => void;
  onClose?: () => void;
  onSuccess?: (message: string) => void;
}

function resolveInitialAuthor(user: ReturnType<typeof useSiteUser>['user']): CommentAuthor {
  if (isLoggedInUser(user)) {
    return { name: user.name, email: user.email ?? '' };
  }
  const saved = readCommentAuthor();
  if (saved) return saved;
  return {
    name: typeof user?.name === 'string' ? user.name : '',
    email: typeof user?.email === 'string' ? user.email : '',
  };
}

export default function CommentEditor({
  hostId,
  parentComment,
  replyComment,
  small = false,
  onOk,
  onClose,
  onSuccess,
}: CommentEditorProps) {
  const { t } = useLocale();
  const { user } = useSiteUser();
  const [addComment, loading] = useAsyncLoading(CommentProvider.addComment);
  const [author, setAuthor] = useState<CommentAuthor>(() => resolveInitialAuthor(user));
  const [content, setContent] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const loggedInAuthor = useMemo(() => (isLoggedInUser(user) ? user : null), [user]);
  const accountEmail = loggedInAuthor?.email?.trim() ?? '';
  const nameReadOnly = Boolean(loggedInAuthor);
  const emailReadOnly = Boolean(loggedInAuthor && accountEmail);

  const effectiveAuthor = useMemo((): CommentAuthor => {
    if (loggedInAuthor) {
      return {
        name: loggedInAuthor.name,
        email: accountEmail || author.email,
      };
    }
    return author;
  }, [accountEmail, author, loggedInAuthor]);

  useEffect(() => {
    if (loggedInAuthor) {
      setAuthor({
        name: loggedInAuthor.name,
        email: accountEmail,
      });
      return;
    }

    const saved = readCommentAuthor();
    if (saved) {
      setAuthor(saved);
      return;
    }

    if (user?.name || user?.email) {
      setAuthor((prev) => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [accountEmail, loggedInAuthor, user?.email, user?.name]);

  const emailError = useMemo(
    () =>
      emailReadOnly
        ? ''
        : getCommentEmailError(author.email, {
            required: t('commentNamespace.userInfoEmailValidMsg'),
            invalid: t('commentNamespace.userInfoIllegalEmailValidMsg'),
          }, { touched: emailTouched }),
    [author.email, emailReadOnly, emailTouched, t],
  );

  const canSubmit = useMemo(() => {
    if (!content.trim()) return false;
    return Boolean(effectiveAuthor.name.trim() && isValidCommentEmail(effectiveAuthor.email));
  }, [content, effectiveAuthor.email, effectiveAuthor.name]);

  const submit = useCallback(() => {
    const trimmedName = effectiveAuthor.name.trim();
    const trimmedEmail = effectiveAuthor.email.trim();
    const trimmedContent = content.trim();

    if (!emailReadOnly) {
      setEmailTouched(true);
    }
    if (!trimmedName || !isValidCommentEmail(trimmedEmail) || !trimmedContent) {
      return;
    }

    const data: Record<string, string> = {
      hostId,
      name: trimmedName,
      email: trimmedEmail,
      avatar: loggedInAuthor?.avatar || '',
      content: trimmedContent,
      url: window.location.pathname,
    };

    if (parentComment?.id) {
      data.parentCommentId = parentComment.id;
    }
    if (replyComment) {
      data.replyUserName = replyComment.name;
      data.replyUserEmail = replyComment.email;
    }

    addComment(data).then(() => {
      if (!loggedInAuthor) {
        persistCommentAuthor({ name: trimmedName, email: trimmedEmail });
      }
      setContent('');
      onSuccess?.(t('commentNamespace.commentSuccess'));
      onOk?.();
    });
  }, [
    addComment,
    content,
    effectiveAuthor.email,
    effectiveAuthor.name,
    emailReadOnly,
    hostId,
    loggedInAuthor,
    onOk,
    onSuccess,
    parentComment?.id,
    replyComment,
    t,
  ]);

  const placeholder = replyComment
    ? `${t('commentNamespace.reply')} ${replyComment.name}`
    : t('commentNamespace.replyPlaceholder');

  return (
    <div className={`rp-comment-editor${small ? ' is-small' : ''}`}>
      {loggedInAuthor ? (
        <p className="rp-comment-lead">
          {t('commentNamespace.commentingAs').replace('{name}', loggedInAuthor.name)}
        </p>
      ) : !small ? (
        <p className="rp-comment-lead">{t('commentNamespace.guestCommentLead')}</p>
      ) : null}

      <div className="rp-comment-author-fields">
        <input
          value={effectiveAuthor.name}
          placeholder={t('commentNamespace.userInfoName')}
          readOnly={nameReadOnly}
          disabled={nameReadOnly}
          onChange={(event) => setAuthor((prev) => ({ ...prev, name: event.target.value }))}
          className="rp-comment-input"
        />
        <div className="rp-comment-field">
          <input
            type="email"
            value={effectiveAuthor.email}
            placeholder={t('commentNamespace.userInfoEmail')}
            readOnly={emailReadOnly}
            disabled={emailReadOnly}
            onBlur={() => setEmailTouched(true)}
            onChange={(event) => setAuthor((prev) => ({ ...prev, email: event.target.value }))}
            className={`rp-comment-input${emailError ? ' is-error' : ''}`}
          />
          {emailError ? <span className="rp-comment-field-error">{emailError}</span> : null}
        </div>
      </div>

      <textarea
        value={content}
        placeholder={placeholder}
        rows={small ? 3 : 4}
        onChange={(event) => setContent(event.target.value)}
        className="rp-comment-textarea"
      />

      <footer>
        <CommentEmoji onPick={(emoji) => setContent((prev) => `${prev}${emoji}`)}>
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
              <circle cx="9" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
              <circle cx="15" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
            </svg>
            <span>{t('commentNamespace.emoji')}</span>
          </>
        </CommentEmoji>

        <div className="rp-comment-actions">
          {onClose ? (
            <button type="button" className="rp-comment-btn" onClick={onClose}>
              {t('commentNamespace.close')}
            </button>
          ) : null}
          <button
            type="button"
            className="rp-comment-btn rp-comment-btn-primary"
            disabled={!canSubmit || loading}
            onClick={submit}
          >
            {loading ? t('loading') : t('commentNamespace.publish')}
          </button>
        </div>
      </footer>
    </div>
  );
}

export function CommentAvatar({
  name,
  avatar,
  size,
}: {
  name: string;
  avatar?: string;
  size: number;
}) {
  if (avatar) {
    return (
      <img
        src={resolveImageUrl(avatar, 'avatar')}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        backgroundColor: getRandomColor(name),
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
