const ALLOWED_COLUMNS: Record<string, string[]> = {
  article: [
    'id',
    'title',
    'content',
    'html',
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
    'content',
    'html',
    'pass',
    'userAgent',
    'createAt',
    'updateAt',
    'parentCommentId',
    'replyUserName',
    'replyUserEmail',
  ],
  file: ['id', 'originalname', 'filename', 'url', 'type', 'size', 'createAt', 'updateAt'],
  page: ['id', 'title', 'path', 'content', 'html', 'status', 'views', 'publishAt', 'createAt', 'updateAt'],
  knowledge: [
    'id',
    'title',
    'content',
    'html',
    'summary',
    'status',
    'views',
    'likes',
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
