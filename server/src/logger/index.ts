import * as fs from 'fs-extra';
import * as log4js from 'log4js';
import { join } from 'path';

const LOG_DIR =
  process.env.REACTPRESS_SERVER_LOG_DIR?.trim() || join(__dirname, '../../logs');

fs.ensureDirSync(LOG_DIR);
void ['request', 'response', 'error'].forEach((t) => {
  fs.ensureDirSync(join(LOG_DIR, t));
});

const resolvePath = (dir, filename) => join(LOG_DIR, dir, filename);

const commonCinfig = {
  type: 'dateFile',
  pattern: '-yyyy-MM-dd.log',
  alwaysIncludePattern: true,
};

log4js.configure({
  appenders: {
    request: {
      ...commonCinfig,
      filename: resolvePath('request', 'request.log'),
      category: 'request',
    },
    response: {
      ...commonCinfig,
      filename: resolvePath('response', 'response.log'),
      category: 'response',
    },
    error: {
      ...commonCinfig,
      filename: resolvePath('error', 'error.log'),
      category: 'error',
    },
  },
  categories: {
    default: { appenders: ['request'], level: 'info' },
    response: { appenders: ['response'], level: 'info' },
    error: { appenders: ['error'], level: 'info' },
  },
});

export const requestLogger = log4js.getLogger('request');
export const responseLogger = log4js.getLogger('response');
export const errorLogger = log4js.getLogger('error');
