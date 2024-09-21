import * as fs from 'fs-extra';
import * as path from 'path';

const dotenv = require('dotenv');

const isProd = process.env.NODE_ENV === 'production';

function parseEnv(): { file: string; config: Record<string, unknown> } {
  const localenv = path.resolve(__dirname, '../../.env');
  const prodenv = path.resolve(__dirname, '../../.env.prod');

  if (!fs.existsSync(localenv) && !fs.existsSync(prodenv)) {
    throw new Error(`Can not locate any .env file in ${__dirname}`);
  }

  const file = isProd && fs.existsSync(prodenv) ? prodenv : localenv;
  const config = dotenv.parse(fs.readFileSync(file));

  return { file, config };
}

export const { file, config } = parseEnv();
