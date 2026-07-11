import fs from 'fs-extra';
import path from 'node:path';

import type { DatabaseEnsureResult, SqliteCredentials } from '../../../types/config';
import { getProjectPaths, SQLITE_REL_PATH } from '../../utils/paths';
import { loadEnvFile } from '../config';

const LEGACY_SQLITE_REL_PATH = path.join('data', 'reactpress.db');

async function maybeMigrateLegacySqlite(projectRoot: string, targetPath: string): Promise<void> {
  const legacyPath = path.join(projectRoot, LEGACY_SQLITE_REL_PATH);
  const normalizedTarget = path.resolve(projectRoot, targetPath);
  const normalizedLegacy = path.resolve(legacyPath);

  if (normalizedLegacy === normalizedTarget) return;
  if (!(await fs.pathExists(legacyPath))) return;
  if (await fs.pathExists(normalizedTarget)) return;

  await fs.ensureDir(path.dirname(normalizedTarget));
  await fs.copyFile(legacyPath, normalizedTarget);
  console.log(
    `[reactpress] Migrated SQLite database: ${LEGACY_SQLITE_REL_PATH} → ${path.relative(projectRoot, normalizedTarget) || SQLITE_REL_PATH}`,
  );
}

export async function resolveSqlitePath(
  projectRoot: string,
  override?: string,
): Promise<string> {
  const paths = getProjectPaths(projectRoot);
  if (override) {
    const resolved = path.resolve(projectRoot, override);
    await maybeMigrateLegacySqlite(projectRoot, resolved);
    return resolved;
  }

  if (await fs.pathExists(paths.envPath)) {
    const env = await loadEnvFile(paths.envPath);
    if (env.DB_DATABASE) {
      const resolved = path.resolve(projectRoot, env.DB_DATABASE);
      await maybeMigrateLegacySqlite(projectRoot, resolved);
      return resolved;
    }
  }

  const target = paths.sqlitePath;
  await maybeMigrateLegacySqlite(projectRoot, target);
  return target;
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
