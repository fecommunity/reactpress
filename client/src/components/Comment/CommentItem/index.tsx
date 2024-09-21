/* eslint-disable @typescript-eslint/no-use-before-define */
import { DownOutlined, MessageOutlined, UpOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

import { Opacity } from '@/components/Animation/Opacity';
import { ConditionTransition } from '@/components/Animation/Transition';
import { LocaleTime } from '@/components/LocaleTime';
import { useToggle } from '@/hooks/useToggle';
import { getRandomColor } from '@/utils';

import { CommentEditor } from '../CommentEditor';
import styles from './index.module.scss';

type Props = {
  comment: IComment;
  parentComment?: IComment;
  isChild: boolean;
  isLast: Boolean;
};

export function CommentItem({ comment, parentComment, isChild = false, isLast = false }: Props) {
  const t = useTranslations('commentNamespace');
  const [editorVisible, toggleEditorVisible] = useToggle(false);
  const [showMore, toggleMore] = useToggle(false);
  const avatarSize = useMemo(() => (isChild ? 20 : 28), [isChild]);
  const paddingHorizontal = useMemo(() => avatarSize + 4, [avatarSize]);

  return (
    <div
      className={cls({
        [styles.commentItem]: true,
        [styles.isParent]: !isChild,
        [styles.isChild]: isChild,
        [styles.isLast]: isLast,
      })}
    >
      <div>
        <header>
          {comment.avatar ? (
            <Avatar size={avatarSize} src={comment.avatar}></Avatar>
          ) : (
            <Avatar size={avatarSize} style={{ backgroundColor: getRandomColor(comment.name) }}>
              {('' + comment.name).charAt(0).toUpperCase()}
            </Avatar>
          )}
          <span className={styles.name}>
            <strong>{comment.name}</strong>
            {comment.replyUserName ? (
              <>
                <span style={{ margin: '0 8px' }}>{t('reply')}</span>
                <strong className={styles.replyUser}>{comment.replyUserName}</strong>
              </>
            ) : null}
          </span>
        </header>
        <main style={{ padding: `8px 0 8px ${paddingHorizontal}px` }}>
          <div dangerouslySetInnerHTML={{ __html: comment.html || comment.content }} />
        </main>
        <footer style={{ paddingLeft: `${paddingHorizontal}px` }}>
          <div className={styles.meta}>
            {comment.userAgent ? (
              <span>
                {comment.userAgent}
                {' · '}
              </span>
            ) : null}
            <LocaleTime date={comment.createAt} timeago={true}></LocaleTime>
            <span className={styles.reply} onClick={toggleEditorVisible}>
              <MessageOutlined style={{ marginRight: 4 }} />
              {t('reply')}
            </span>
          </div>
          <ConditionTransition
            visible={editorVisible}
            options={{
              from: { opacity: 0, height: 0 },
              enter: { opacity: 1, height: 155 },
              leave: { opacity: 0, height: 0 },
            }}
          >
            <div className={styles.editorWrapper}>
              <CommentEditor
                small={true}
                hostId={comment.hostId}
                parentComment={parentComment}
                replyComment={comment}
                onOk={toggleEditorVisible}
                onClose={toggleEditorVisible}
              />
            </div>
          </ConditionTransition>
          {comment.children && comment.children.length ? (
            <div className={styles.childWrapper}>
              <Comments
                comments={comment.children.slice(0, showMore ? comment.children.length : 2)}
                parentComment={comment}
                isChild={true}
              />
              {comment.children.length > 2 ? (
                <div className={styles.showMore} onClick={toggleMore}>
                  {showMore ? (
                    <>
                      收起 <UpOutlined />
                    </>
                  ) : (
                    <>
                      查看更多 <DownOutlined />
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

export function Comments({ comments, parentComment = null, isChild = false }) {
  return (
    <div>
      {comments.map((comment, index) => {
        const component = (
          <CommentItem
            key={`${(parentComment && parentComment.id) || 'root'}-${comment.id}`}
            comment={comment}
            parentComment={parentComment || comment}
            isChild={isChild}
            isLast={index === comments.length - 1}
          />
        );
        return isChild ? (
          <Opacity key={`${(parentComment && parentComment.id) || 'root'}-${comment.id}`}>{component}</Opacity>
        ) : (
          component
        );
      })}
    </div>
  );
}
