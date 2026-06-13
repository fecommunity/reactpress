import fs from 'fs-extra';
import path from 'node:path';

import type { DatabaseEnsureResult, SqliteCredentials } from '../../../types/config';
import { getProjectPaths } from '../../utils/paths';
import { loadEnvFile } from '../config';

export async function resolveSqlitePath(
  projectRoot: string,
  override?: string,
): Promise<string> {
  const paths = getProjectPaths(projectRoot);
  if (override) return path.resolve(projectRoot, override);
  if (await fs.pathExists(paths.envPath)) {
    const env = await loadEnvFile(paths.envPath);
    if (env.DB_DATABASE) return path.resolve(projectRoot, env.DB_DATABASE);
  }
  return paths.sqlitePath;
}

export async function getSqliteCredentials(projectRoot: string): Promise<SqliteCredentials> {
  const database = await resolveSqlitePath(projectRoot);
  return { database };
}

export async function ensureSqliteDatabase(projectRoot: string): Promise<DatabaseEnsureResult> {
  const database = await resolveSqlitePath(projectRoot);
  const dir = path.dirname(database);
  await fs.ensureDir(dir);

  try {
    await fs.access(dir, fs.constants.W_OK);
  } catch {
    return { ok: false, message: `SQLite 数据目录不可写: ${dir}` };
  }

  if (!(await fs.pathExists(database))) {
    await fs.writeFile(database, Buffer.alloc(0));
  }

  return { ok: true };
}

export async function probeSqliteDatabase(
  projectRoot: string,
): Promise<{ ok: boolean; message?: string }> {
  const database = await resolveSqlitePath(projectRoot);
  const dir = path.dirname(database);

  if (!(await fs.pathExists(dir))) {
    return { ok: false, message: `SQLite 目录不存在: ${dir}` };
  }

  try {
    await fs.access(dir, fs.constants.W_OK);
  } catch {
    return { ok: false, message: `SQLite 目录不可写: ${dir}` };
  }

  if (await fs.pathExists(database)) {
    const stat = await fs.stat(database);
    return {
      ok: true,
      message: `SQLite ${database} (${stat.size} bytes)`,
    };
  }

  return {
    ok: true,
    message: `SQLite 将在启动时创建: ${database}`,
  };
}

export async function isSqliteReady(projectRoot: string): Promise<boolean> {
  const result = await ensureSqliteDatabase(projectRoot);
  return result.ok;
}
