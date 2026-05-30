import { Button, Popover } from 'antd';
import React from 'react';

export const CommentHTML = ({ comment }) => {
  return (
    <span>
      <Popover
        title={'评论详情-HTML 内容'}
        content={
          <div
            className="markdown"
            style={{ maxWidth: 320 }}
            dangerouslySetInnerHTML={{
              __html: comment && comment.html,
            }}
          ></div>
        }
      >
        <Button type="link" style={{ paddingLeft: 0 }}>
          查看内容
        </Button>
      </Popover>
    </span>
  );
};
