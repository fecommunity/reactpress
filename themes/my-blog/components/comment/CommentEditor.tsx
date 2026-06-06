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
  return {
    name: typeof user?.name === 'string' ? user.name : '',
    email: typeof user?.email === 'string' ? user.email : '',
  };
}

function resolveAccountEmail(user: ReturnType<typeof useSiteUser>['user']): string {
  const email = user?.email?.trim() ?? '';
  return email && isValidCommentEmail(email) ? email : '';
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
  const [persistedEmail, setPersistedEmail] = useState('');

  const loggedInAuthor = useMemo(() => (isLoggedInUser(user) ? user : null), [user]);
  const accountEmail = useMemo(() => resolveAccountEmail(loggedInAuthor ?? user), [loggedInAuthor, user]);
  const knownEmail = accountEmail || persistedEmail;
  const nameReadOnly = Boolean(loggedInAuthor);
  const emailReadOnly = Boolean(knownEmail);

  const effectiveAuthor = useMemo((): CommentAuthor => {
    if (loggedInAuthor) {
      return {
        name: loggedInAuthor.name,
        email: knownEmail || author.email,
      };
    }
    return {
      name: author.name,
      email: emailReadOnly ? knownEmail : author.email,
    };
  }, [author, emailReadOnly, knownEmail, loggedInAuthor]);

  useEffect(() => {
    if (loggedInAuthor) {
      setAuthor({
        name: loggedInAuthor.name,
        email: accountEmail,
      });
      setPersistedEmail('');
      return;
    }

    const saved = readCommentAuthor();
    if (saved) {
      setAuthor(saved);
      const savedEmail = saved.email?.trim() ?? '';
      setPersistedEmail(
        savedEmail && isValidCommentEmail(savedEmail) ? savedEmail : '',
      );
      return;
    }

    setPersistedEmail('');
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
          disabled={nameReadOnly}
          onChange={(event) => setAuthor((prev) => ({ ...prev, name: event.target.value }))}
          className="rp-comment-input"
        />
        <div>
          <input
            type="email"
            value={effectiveAuthor.email}
            placeholder={t('commentNamespace.userInfoEmail')}
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
            <svg viewBox="0 0 1024 1024" width="18" height="18" aria-hidden>
              <path
                d="M288.92672 400.45568c0 30.80192 24.97024 55.77216 55.77216 55.77216s55.77216-24.97024 55.77216-55.77216c0-30.7968-24.97024-55.76704-55.77216-55.76704s-55.77216 24.97024-55.77216 55.76704z m334.60224 0c0 30.80192 24.97024 55.77216 55.77216 55.77216s55.77216-24.97024 55.77216-55.77216c0-30.7968-24.97024-55.76704-55.77216-55.76704s-55.77216 24.97024-55.77216 55.76704z m-111.5392 362.4704c-78.05952 0-156.13952-39.08096-200.75008-100.3776-16.77312-22.31296-27.84256-50.15552-39.08096-72.45824-5.53472-16.77312 5.5296-33.4592 16.77312-39.08096 16.77312-5.53472 27.84256 5.53472 33.46432 16.768 5.53472 22.30784 16.77312 39.08608 27.84256 55.77728 44.61568 55.76704 100.38272 83.69664 161.664 83.69664 61.30176 0 122.7008-27.84256 156.16-78.07488 11.15136-16.77824 22.30784-38.99904 27.84256-55.77728 5.62176-16.768 22.30784-22.30272 33.4592-16.768 16.768 5.53472 22.30784 22.30272 16.768 33.4592-5.61152 27.84256-22.2976 50.14528-39.08096 72.45824-38.912 61.37856-116.98176 100.3776-195.06176 100.3776z m0 194.51392C268.4928 957.44 66.56 755.52256 66.56 511.99488 66.56 268.48256 268.4928 66.56 511.98976 66.56 755.50208 66.56 957.44 268.48256 957.44 511.99488 957.44 755.52256 755.50208 957.44 511.98976 957.44z m0-831.45728c-213.78048 0-386.00192 172.21632-386.00192 386.01216 0 213.8112 172.22144 386.0224 386.00192 386.0224 213.80096 0 386.0224-172.2112 386.0224-386.0224 0-213.79584-172.22144-386.01216-386.0224-386.01216z"
                fill="currentColor"
              />
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
