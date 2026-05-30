import { Button, Input, message } from 'antd';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isValidUser } from '@/components/UserInfo';
import { GlobalContext } from '@/context/global';
import { useAsyncLoading } from '@/hooks/useAsyncLoading';
import { CommentProvider } from '@/providers/comment';
import {
  getCommentEmailError,
  isValidCommentEmail,
  persistCommentAuthor,
  readCommentAuthor,
  type CommentAuthor,
} from '@fecommunity/reactpress-toolkit/theme';

import { Emoji } from './Emoji';
import styles from './index.module.scss';

const { TextArea } = Input;

interface Props {
  hostId: string;
  parentComment?: IComment;
  replyComment?: IComment;
  onOk?: () => void;
  onClose?: () => void;
  small?: boolean;
}

function resolveInitialAuthor(user: IUser | Partial<IUser> | null | undefined): CommentAuthor {
  if (isValidUser(user)) {
    return { name: user.name, email: user.email };
  }
  const saved = readCommentAuthor();
  if (saved) return saved;
  return {
    name: typeof user?.name === 'string' ? user.name : '',
    email: typeof user?.email === 'string' ? user.email : '',
  };
}

export const CommentEditor: React.FC<Props> = ({ hostId, parentComment, replyComment, onOk, onClose, small }) => {
  const t = useTranslations('commentNamespace');
  const { user } = useContext(GlobalContext);
  const [addComment, loading] = useAsyncLoading(CommentProvider.addComment);
  const [author, setAuthor] = useState<CommentAuthor>(() => resolveInitialAuthor(user));
  const [content, setContent] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const loggedInAuthor = useMemo(() => (isValidUser(user) ? user : null), [user]);

  const effectiveAuthor = useMemo((): CommentAuthor => {
    if (loggedInAuthor) {
      return { name: loggedInAuthor.name, email: loggedInAuthor.email };
    }
    return author;
  }, [loggedInAuthor, author]);

  useEffect(() => {
    if (loggedInAuthor) return;
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
  }, [loggedInAuthor, user?.name, user?.email]);

  const textareaPlaceholder = useMemo(
    () => (replyComment ? `${t('reply')} ${replyComment.name}` : t('replyPlaceholder')),
    [t, replyComment],
  );
  const textareaSize = useMemo(() => (small ? { minRows: 3, maxRows: 6 } : { minRows: 4, maxRows: 8 }), [small]);
  const btnSize = useMemo(() => (small ? 'small' : 'middle'), [small]);
  const showAuthorFields = !loggedInAuthor;
  const emailError = useMemo(
    () =>
      showAuthorFields
        ? getCommentEmailError(author.email, {
            required: t('userInfoEmailValidMsg') as string,
            invalid: t('userInfoIllegalEmailValidMsg') as string,
          }, { touched: emailTouched })
        : '',
    [author.email, emailTouched, showAuthorFields, t],
  );
  const canSubmit = useMemo(() => {
    if (!content.trim()) return false;
    if (!showAuthorFields) return true;
    return Boolean(author.name.trim() && isValidCommentEmail(author.email));
  }, [author.email, author.name, content, showAuthorFields]);

  const emojiTrigger = (
    <span className={styles.emojiTrigger}>
      <svg viewBox="0 0 1024 1024" width="18px" height="18px">
        <path
          d="M288.92672 400.45568c0 30.80192 24.97024 55.77216 55.77216 55.77216s55.77216-24.97024 55.77216-55.77216c0-30.7968-24.97024-55.76704-55.77216-55.76704s-55.77216 24.97024-55.77216 55.76704z m334.60224 0c0 30.80192 24.97024 55.77216 55.77216 55.77216s55.77216-24.97024 55.77216-55.77216c0-30.7968-24.97024-55.76704-55.77216-55.76704s-55.77216 24.97024-55.77216 55.76704z m-111.5392 362.4704c-78.05952 0-156.13952-39.08096-200.75008-100.3776-16.77312-22.31296-27.84256-50.15552-39.08096-72.45824-5.53472-16.77312 5.5296-33.4592 16.77312-39.08096 16.77312-5.53472 27.84256 5.53472 33.46432 16.768 5.53472 22.30784 16.77312 39.08608 27.84256 55.77728 44.61568 55.76704 100.38272 83.69664 161.664 83.69664 61.30176 0 122.7008-27.84256 156.16-78.07488 11.15136-16.77824 22.30784-38.99904 27.84256-55.77728 5.62176-16.768 22.30784-22.30272 33.4592-16.768 16.768 5.53472 22.30784 22.30272 16.768 33.4592-5.61152 27.84256-22.2976 50.14528-39.08096 72.45824-38.912 61.37856-116.98176 100.3776-195.06176 100.3776z m0 194.51392C268.4928 957.44 66.56 755.52256 66.56 511.99488 66.56 268.48256 268.4928 66.56 511.98976 66.56 755.50208 66.56 957.44 268.48256 957.44 511.99488 957.44 755.52256 755.50208 957.44 511.98976 957.44z m0-831.45728c-213.78048 0-386.00192 172.21632-386.00192 386.01216 0 213.8112 172.22144 386.0224 386.00192 386.0224 213.80096 0 386.0224-172.2112 386.0224-386.0224 0-213.79584-172.22144-386.01216-386.0224-386.01216z"
          fill="currentColor"
        ></path>
      </svg>
      <span>{t('emoji')}</span>
    </span>
  );

  const addEmoji = useCallback((emoji: string) => {
    setContent((prev) => `${prev}${emoji}`);
  }, []);

  const submit = useCallback(() => {
    const trimmedName = effectiveAuthor.name.trim();
    const trimmedEmail = effectiveAuthor.email.trim();
    const trimmedContent = content.trim();

    if (!loggedInAuthor) {
      setEmailTouched(true);
    }

    if (!trimmedName) {
      message.warning(t('userInfoNameValidMsg'));
      return;
    }
    if (!isValidCommentEmail(trimmedEmail)) {
      message.warning(t('userInfoIllegalEmailValidMsg'));
      return;
    }
    if (!trimmedContent) {
      return;
    }

    const data = {
      hostId,
      name: trimmedName,
      email: trimmedEmail,
      avatar: loggedInAuthor?.avatar || '',
      content: trimmedContent,
      url: window.location.pathname,
    };

    if (parentComment?.id) {
      Object.assign(data, { parentCommentId: parentComment.id });
    }

    if (replyComment) {
      Object.assign(data, {
        replyUserName: replyComment.name,
        replyUserEmail: replyComment.email,
      });
    }

    addComment(data).then(() => {
      if (!loggedInAuthor) {
        persistCommentAuthor({ name: trimmedName, email: trimmedEmail });
      }
      message.success(t('commentSuccess'));
      setContent('');
      onOk?.();
    });
  }, [t, hostId, parentComment, replyComment, onOk, effectiveAuthor, content, addComment, loggedInAuthor]);

  return (
    <div className={cls(styles.wrapper, small && styles.small)}>
      {!small && !loggedInAuthor ? <p className={styles.lead}>{t('guestCommentLead')}</p> : null}
      {loggedInAuthor ? (
        <p className={styles.lead}>{t('commentingAs', { name: loggedInAuthor.name })}</p>
      ) : null}
      {showAuthorFields ? (
        <div className={styles.authorFields}>
          <Input
            value={author.name}
            placeholder={t('userInfoName') as string}
            onChange={(e) => setAuthor((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className={styles.emailField}>
            <Input
              type="email"
              value={author.email}
              placeholder={t('userInfoEmail') as string}
              status={emailError ? 'error' : undefined}
              onBlur={() => setEmailTouched(true)}
              onChange={(e) => setAuthor((prev) => ({ ...prev, email: e.target.value }))}
            />
            {emailError ? <span className={styles.fieldError}>{emailError}</span> : null}
          </div>
        </div>
      ) : null}
      <div className={styles.textareaWrapper}>
        <TextArea
          placeholder={textareaPlaceholder as string}
          autoSize={textareaSize}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <footer>
        <Emoji onClickEmoji={addEmoji}>{emojiTrigger}</Emoji>
        <div>
          {onClose ? (
            <Button onClick={onClose} style={{ marginRight: 16 }} size={btnSize}>
              {t('close')}
            </Button>
          ) : null}
          <Button loading={loading} onClick={submit} type="primary" disabled={!canSubmit} size={btnSize}>
            {t('publish')}
          </Button>
        </div>
      </footer>
    </div>
  );
};
