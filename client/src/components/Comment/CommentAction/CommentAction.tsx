import { Divider, Input, message, Modal, notification, Popconfirm } from 'antd';
import React, { useCallback, useState } from 'react';

import { useSetting } from '@/hooks/useSetting';
import { CommentProvider } from '@/providers/comment';
import { SettingProvider } from '@/providers/setting';

import style from './index.module.scss';

export const CommentAction = ({ comment, refresh }) => {
  const setting = useSetting();
  const [replyContent, setReplyContent] = useState(null);
  const [replyVisible, setReplyVisible] = useState(false);

  // 修改评论
  const updateComment = useCallback(
    (comment, pass = false) => {
      CommentProvider.updateComment(comment.id, { pass }).then(() => {
        message.success(pass ? '评论已通过' : '评论已拒绝');
        refresh();
      });
    },
    [refresh]
  );

  const reply = useCallback(() => {
    if (!replyContent) {
      return;
    }
    const userInfo = JSON.parse(window.localStorage.getItem('user'));
    const email = (userInfo && userInfo.mail) || (setting && setting.smtpFromUser);
    const notify = () => {
      notification.error({
        message: '回复评论失败',
        description: '请前往系统设置完善 SMTP 设置，前往个人中心更新个人邮箱。',
      });
    };

    const handle = (email) => {
      const data = {
        name: userInfo.name,
        email,
        content: replyContent,
        parentCommentId: comment.parentCommentId || comment.id,
        hostId: comment.hostId,
        isHostInPage: comment.isHostInPage,
        replyUserName: comment.name,
        replyUserEmail: comment.email,
        url: comment.url,
        createByAdmin: true,
      };

      CommentProvider.addComment(data)
        .then(() => {
          message.success('回复成功');
          setReplyContent('');
          refresh();
        })
        .catch(() => notify());
    };

    if (!email) {
      SettingProvider.getSetting()
        .then((res) => {
          if (res && res.smtpFromUser) {
            handle(res.smtpFromUser);
          } else {
            notify();
          }
          setReplyVisible(false);
        })
        .catch(() => {
          notify();
          setReplyVisible(false);
        });
    } else {
      handle(email);
      setReplyVisible(false);
    }
  }, [
    replyContent,
    comment.email,
    comment.hostId,
    comment.id,
    comment.isHostInPage,
    comment.name,
    comment.parentCommentId,
    comment.url,
    refresh,
    setting,
  ]);

  // 删除评论
  const deleteComment = useCallback(
    (id) => {
      CommentProvider.deleteComment(id).then(() => {
        message.success('评论删除成功');
        refresh();
      });
    },
    [refresh]
  );

  return (
    <div>
      <span className={style.action}>
        <a onClick={() => updateComment(comment, true)}>通过</a>
        <Divider type="vertical" />
        <a onClick={() => updateComment(comment, false)}>拒绝</a>
        <Divider type="vertical" />
        <a onClick={() => setReplyVisible(true)}>回复</a>
        <Divider type="vertical" />
        <Popconfirm
          title="确认删除这个评论？"
          onConfirm={() => deleteComment(comment.id)}
          okText="确认"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      </span>
      <Modal
        title={'回复评论'}
        visible={replyVisible}
        cancelText={'取消'}
        okText={'回复'}
        onOk={reply}
        onCancel={() => setReplyVisible(false)}
        transitionName={''}
        maskTransitionName={''}
      >
        <Input.TextArea
          autoSize={{ minRows: 6, maxRows: 10 }}
          placeholder="支持 Markdown"
          value={replyContent}
          autoFocus={true}
          onChange={(e) => {
            const val = e.target.value;
            setReplyContent(val);
          }}
        ></Input.TextArea>
      </Modal>
    </div>
  );
};
