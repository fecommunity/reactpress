import fs from 'fs-extra';
import path from 'node:path';

import type { DatabaseEnsureResult, MysqlCredentials } from '../../../types/config';

export type ConnectionTester = (creds: MysqlCredentials) => Promise<boolean>;

async function defaultConnectionTester(creds: MysqlCredentials): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require('mysql2/promise') as typeof import('mysql2/promise');
    const connection = await mysql.createConnection({
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      database: creds.database,
      connectTimeout: 5000,
    });
    await connection.query('SELECT 1');
    await connection.end();
    return true;
  } catch {
    return false;
  }
}

let connectionTester: ConnectionTester = defaultConnectionTester;

/** @internal test hook */
export function setConnectionTesterForTests(tester: ConnectionTester | null): void {
  connectionTester = tester ?? defaultConnectionTester;
}

export async function testMysqlConnection(creds: MysqlCredentials): Promise<boolean> {
  return connectionTester(creds);
}

export async function waitForMysql(
  creds: MysqlCredentials,
  maxAttempts = 40,
  intervalMs = 1000,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await testMysqlConnection(creds)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

import { loadEnvFile } from '../config';
import { getProjectPaths } from '../../utils/paths';

export async function getDatabaseCredentials(projectRoot: string): Promise<MysqlCredentials> {
  const { envPath } = getProjectPaths(projectRoot);
  if (!(await fs.pathExists(envPath))) {
    return { ...DEFAULT_CREDS };
  }
  const env = await loadEnvFile(envPath);
  return {
    host: env.DB_HOST ?? DEFAULT_CREDS.host,
    port: Number(env.DB_PORT ?? DEFAULT_CREDS.port),
    user: env.DB_USER ?? DEFAULT_CREDS.user,
    password: env.DB_PASSWD ?? DEFAULT_CREDS.password,
    database: env.DB_DATABASE ?? DEFAULT_CREDS.database,
  };
}

const DEFAULT_CREDS: MysqlCredentials = {
  host: '127.0.0.1',
  port: 3306,
  user: 'reactpress',
  password: 'reactpress',
  database: 'reactpress',
};

export async function probeMysqlHost(
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ok = await testMysqlConnection({ host, port, user, password, database });
    return ok ? { ok: true } : { ok: false, error: 'connection refused' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export { DEFAULT_CREDS };
