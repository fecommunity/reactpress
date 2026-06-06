import type { IComment } from '@fecommunity/reactpress-toolkit/types';

export type CommentNode = IComment & { children?: CommentNode[] };

const AVATAR_COLORS = [
  '#52c41a', '#f5222d', '#1890ff', '#faad14', '#ff0064', '#722ed1',
  '#dc3545', '#17a2b8', '#00b74a', '#fc651f', '#6c757d', '#f5c800',
  '#808695', '#2db7f5', '#87d068', '#108ee9',
];

const colorCache: Record<string, string> = {};

export function getRandomColor(key: string): string {
  if (!colorCache[key]) {
    colorCache[key] = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  }
  return colorCache[key];
}

type SessionUser = {
  name?: string;
  email?: string;
  token?: string;
  avatar?: string;
};

export function isLoggedInUser(user: SessionUser | null | undefined): user is SessionUser & { name: string; token: string } {
  return Boolean(user?.name?.trim() && user?.token?.trim());
}

export const COMMENT_DOM_ID = 'js-comment-id';
