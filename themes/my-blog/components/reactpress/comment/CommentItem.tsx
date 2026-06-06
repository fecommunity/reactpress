'use client';

import CommentEditor, { CommentAvatar } from '@/components/reactpress/comment/CommentEditor';
import { type CommentNode } from '@/src/utils/comment';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import { useToggle } from '@fecommunity/reactpress-toolkit/theme';

interface CommentItemProps {
  comment: CommentNode;
  parentComment?: CommentNode;
  isChild?: boolean;
  isLast?: boolean;
  onSuccess?: (message: string) => void;
}

export default function CommentItem({
  comment,
  parentComment,
  isChild = false,
  isLast = false,
  onSuccess,
}: CommentItemProps) {
  const { t } = useLocale();
  const [editorVisible, toggleEditorVisible] = useToggle(false);
  const [showMore, toggleMore] = useToggle(false);
  const avatarSize = isChild ? 20 : 28;
  const paddingHorizontal = avatarSize + 4;

  return (
    <div
      className={`rp-comment-item${isChild ? ' is-child' : ' is-parent'}${isChild && isLast ? ' is-last' : ''}`}
    >
      <div>
        <header>
          <CommentAvatar name={comment.name} avatar={comment.avatar} size={avatarSize} />
          <span className="rp-comment-name">
            <strong>{comment.name}</strong>
            {comment.replyUserName ? (
              <>
                <span style={{ margin: '0 8px' }}>{t('commentNamespace.reply')}</span>
                <strong>{comment.replyUserName}</strong>
              </>
            ) : null}
          </span>
        </header>

        <main style={{ padding: `8px 0 8px ${paddingHorizontal}px` }}>
          <div
            className="rp-rich-text"
            dangerouslySetInnerHTML={{ __html: comment.html || comment.content }}
          />
        </main>

        <footer style={{ paddingLeft: `${paddingHorizontal}px` }}>
          <div className="rp-comment-meta">
            {comment.userAgent ? (
              <span>
                {comment.userAgent}
                {' · '}
              </span>
            ) : null}
            <LocaleTime date={comment.createAt} timeago />
            <button type="button" className="rp-comment-reply-btn" onClick={toggleEditorVisible}>
              {t('commentNamespace.reply')}
            </button>
          </div>

          {editorVisible ? (
            <div className="rp-comment-reply-editor">
              <CommentEditor
                small
                hostId={comment.hostId}
                parentComment={parentComment}
                replyComment={comment}
                onOk={toggleEditorVisible}
                onClose={toggleEditorVisible}
                onSuccess={onSuccess}
              />
            </div>
          ) : null}

          {comment.children?.length ? (
            <div className="rp-comment-children">
              <CommentList
                comments={comment.children.slice(0, showMore ? comment.children.length : 2)}
                parentComment={comment}
                isChild
                onSuccess={onSuccess}
              />
              {comment.children.length > 2 ? (
                <div className="rp-comment-show-more" onClick={toggleMore}>
                  {showMore ? '收起 ↑' : '查看更多 ↓'}
                </div>
              ) : null}
            </div>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

interface CommentListProps {
  comments: CommentNode[];
  parentComment?: CommentNode | null;
  isChild?: boolean;
  onSuccess?: (message: string) => void;
}

export function CommentList({
  comments,
  parentComment = null,
  isChild = false,
  onSuccess,
}: CommentListProps) {
  return (
    <div>
      {comments.map((comment, index) => (
        <CommentItem
          key={`${parentComment?.id || 'root'}-${comment.id}`}
          comment={comment}
          parentComment={parentComment || comment}
          isChild={isChild}
          isLast={index === comments.length - 1}
          onSuccess={onSuccess}
        />
      ))}
    </div>
  );
}
