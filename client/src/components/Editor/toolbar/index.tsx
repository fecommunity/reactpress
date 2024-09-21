import React from 'react';

import { AddCode } from './AddCode';
import { Emoji } from './Emoji';
import { File } from './File';
import { Iframe } from './Iframe';
import { Image } from './Image';
import { Magimg } from './Magimg';
import { Video } from './Video';

export const toolbar = [
  {
    label: '表情',
    content: ({ editor, monaco }) => <Emoji editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '上传图片',
    content: ({ editor, monaco }) => <Image editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '上传视频',
    content: ({ editor, monaco }) => <Video editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '嵌入链接',
    content: ({ editor, monaco }) => <Iframe editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '文件库',
    content: ({ editor, monaco }) => <File editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '放大图片',
    content: ({ editor, monaco }) => <Magimg editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
  {
    label: '添加代码块',
    content: ({ editor, monaco }) => <AddCode editor={editor} monaco={monaco} />,
    getAction: () => () => {
      return undefined;
    },
  },
];
