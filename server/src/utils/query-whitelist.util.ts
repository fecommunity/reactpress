const ALLOWED_COLUMNS: Record<string, string[]> = {
  article: [
    'id',
    'title',
    'cover',
    'content',
    'html',
    'toc',
    'summary',
    'status',
    'views',
    'likes',
    'isRecommended',
    'needPassword',
    'password',
    'publishAt',
    'createAt',
    'updateAt',
  ],
  comment: [
    'id',
    'hostId',
    'name',
    'email',
    'avatar',
    'content',
    'html',
    'pass',
    'userAgent',
    'url',
    'createAt',
    'updateAt',
    'parentCommentId',
    'replyUserName',
    'replyUserEmail',
  ],
  file: ['id', 'originalname', 'filename', 'url', 'type', 'size', 'createAt', 'updateAt'],
  page: [
    'id',
    'name',
    'cover',
    'path',
    'order',
    'content',
    'html',
    'toc',
    'status',
    'views',
    'publishAt',
    'createAt',
    'updateAt',
  ],
  knowledge: [
    'id',
    'title',
    'cover',
    'content',
    'html',
    'toc',
    'summary',
    'status',
    'views',
    'likes',
    'isCommentable',
    'order',
    'parentId',
    'publishAt',
    'createAt',
    'updateAt',
  ],
};

export function filterByWhitelist(entity: string, params: Record<string, unknown>): Record<string, unknown> {
  const whitelist = ALLOWED_COLUMNS[entity];
  if (!whitelist) return {};

  const { page, pageSize, status, pass, ...otherParams } = params as Record<string, unknown>;
  const filtered: Record<string, unknown> = {};

  Object.keys(otherParams).forEach((key) => {
    if (whitelist.includes(key)) {
      filtered[key] = otherParams[key];
    }
  });

  return filtered;
}
