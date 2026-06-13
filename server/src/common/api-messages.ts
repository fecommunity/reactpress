/** API error and notification messages — English first */
export const ApiMsg = {
  AUTH_FAILED: 'Authentication failed',
  MISSING_API_KEY: 'Missing API Key',
  INVALID_API_KEY: 'Invalid API Key',
  API_KEY_NOT_FOUND: 'API Key not found',
  API_KEY_MISSING_READ: 'API Key missing read permission',
  MISSING_PARAMS: 'Missing required parameters',
  EMAIL_SEND_FAILED: 'Failed to send email',
  EMAIL_CONFIG_INCOMPLETE: 'SMTP configuration is incomplete',
  EMAIL_TEST_SENT: 'Test email sent successfully',
  OSS_CONFIG_INCOMPLETE: 'OSS configuration is incomplete',
  WEBHOOK_NOT_FOUND: 'Webhook not found',

  USERNAME_PASSWORD_REQUIRED: 'Username and password are required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  ADMIN_CONSOLE_ACCESS_REQUIRED: 'Please contact an administrator for access authorization',
  USERNAME_INVALID: 'Username cannot contain spaces or invalid characters',
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_LOCKED: 'User is locked and cannot sign in',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts, please try again later',
  FORBIDDEN: 'You do not have permission for this action',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN_ACTION: 'Forbidden',

  ARTICLE_TITLE_EXISTS: 'Article title already exists',
  ARTICLE_SLUG_EXISTS: 'Article slug already exists',
  REVISION_NOT_FOUND: 'Revision not found',

  TAG_EXISTS: 'Tag already exists',
  CATEGORY_EXISTS: 'Category already exists',
  PAGE_EXISTS: 'Page already exists',
  KNOWLEDGE_EXISTS: 'Knowledge base already exists',
  INVALID_KNOWLEDGE_SECTION: 'Invalid knowledge section',
  DELETE_HAS_ARTICLES: 'Delete failed: related articles may exist',

  GITHUB_CODE_REQUIRED: 'GitHub authorization code is required',
  GITHUB_EMAIL_REQUIRED: 'Public email is required for GitHub sign-in',

  EMAIL_NEW_COMMENT: 'New comment notification',
  EMAIL_COMMENT_REPLY: 'Comment reply notification',
  EMAIL_GITHUB_LOGIN: 'GitHub sign-in notification',
  EMAIL_TEST_SUBJECT: 'ReactPress SMTP test email',
  EMAIL_TEST_HTML:
    'This is a test email from your ReactPress site. If you received this message, SMTP is configured correctly.',
} as const;
