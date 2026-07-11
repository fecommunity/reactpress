import fs from 'fs-extra';
import path from 'node:path';

import type { DatabaseProfile, EnvMap, ReactPressConfig } from '../../../types/config';
import { getProjectPaths } from '../../utils/paths';
import { isSqliteMode, loadConfig, loadEnvFile } from '../config';

const DEFAULT_MYSQL = {
  host: '127.0.0.1',
  port: 3306,
  user: 'reactpress',
  password: 'reactpress',
  database: 'reactpress',
} as const;

export function resolveDatabaseType(config: ReactPressConfig, env: EnvMap): 'mysql' | 'sqlite' {
  const envType = String(env.DB_TYPE || '').toLowerCase();
  if (envType === 'sqlite') return 'sqlite';
  if (isSqliteMode(config)) return 'sqlite';
  return 'mysql';
}

export async function resolveDatabaseProfile(projectRoot: string): Promise<DatabaseProfile> {
  const config = await loadConfig(projectRoot);
  const { envPath, sqlitePath } = getProjectPaths(projectRoot);
  const env = (await fs.pathExists(envPath)) ? await loadEnvFile(envPath) : {};
  const type = resolveDatabaseType(config, env);

  if (type === 'sqlite') {
    const database =
      env.DB_DATABASE ?? config.database.sqlitePath ?? sqlitePath;
    return {
      type: 'sqlite',
      mode: config.database.mode,
      sqlite: { database: path.resolve(projectRoot, database) },
    };
  }

  return {
    type: 'mysql',
    mode: config.database.mode,
    mysql: {
      host: env.DB_HOST ?? config.database.host ?? DEFAULT_MYSQL.host,
      port: Number(env.DB_PORT ?? config.database.port ?? DEFAULT_MYSQL.port),
      user: env.DB_USER ?? config.database.user ?? DEFAULT_MYSQL.user,
      password: env.DB_PASSWD ?? config.database.password ?? DEFAULT_MYSQL.password,
      database: env.DB_DATABASE ?? config.database.database ?? DEFAULT_MYSQL.database,
    },
  };
}

export function isLocalDatabaseMode(config: ReactPressConfig): boolean {
  return config.database.mode === 'embedded-sqlite';
}

export function requiresDocker(config: ReactPressConfig): boolean {
  return config.database.mode === 'embedded-docker';
}
