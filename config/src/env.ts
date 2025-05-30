import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';

const isProd = process.env.NODE_ENV === 'production';

interface EnvConfig {
  file: string;
  config: Record<string, string>;
}

function parseEnv(): EnvConfig {
  const localenv = path.resolve(__dirname, '../../.env');
  const prodenv = path.resolve(__dirname, '../../.env.prod');

  const envFiles = [
    { path: prodenv, isProd: true },
    { path: localenv, isProd: false }
  ];

  const availableEnvFiles = envFiles.filter(({ path: envPath }) => fs.existsSync(envPath));
  
  if (availableEnvFiles.length === 0) {
    throw new Error(
      `No environment file found. Expected one of:\n` +
      `- ${localenv}\n` +
      `- ${prodenv}`
    );
  }

  const file = availableEnvFiles.find(({ isProd: prod }) => isProd === prod)?.path || 
               availableEnvFiles[0].path;
  try {
    const envContent = fs.readFileSync(file, 'utf8');
    const config = dotenv.parse(envContent);
    
    if (Object.keys(config).length === 0) {
      console.warn(`Warning: No environment variables found in ${file}`);
    }

    return { file, config };
  } catch (error) {
    throw new Error(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const { file, config } = parseEnv();