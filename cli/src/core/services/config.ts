import fs from 'fs-extra';

import type { EnvMap, ReactPressConfig } from '../../types/config';
import { getProjectPaths } from '../utils/paths';

export async function loadConfig(projectRoot: string): Promise<ReactPressConfig> {
  const { configPath } = getProjectPaths(projectRoot);
  if (!(await fs.pathExists(configPath))) {
    throw new Error('未找到 ReactPress 项目。请先运行 reactpress init 初始化。');
  }
  return fs.readJson(configPath) as Promise<ReactPressConfig>;
}

export async function saveConfig(projectRoot: string, config: ReactPressConfig): Promise<void> {
  const { configPath, reactpressDir } = getProjectPaths(projectRoot);
  await fs.ensureDir(reactpressDir);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function loadEnvFile(envPath: string): Promise<EnvMap> {
  const content = await fs.readFile(envPath, 'utf8');
  const map: EnvMap = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    map[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return map;
}

export async function writeEnvFile(envPath: string, map: EnvMap): Promise<void> {
  const lines = [
    '# ReactPress — managed by reactpress-cli',
    ...Object.entries(map).map(([k, v]) => `${k}=${v}`),
    '',
  ];
  await fs.writeFile(envPath, lines.join('\n'), 'utf8');
}

export function isSqliteMode(config: ReactPressConfig): boolean {
  return config.database.mode === 'embedded-sqlite';
}

export async function syncEnvFromConfig(
  projectRoot: string,
  config: ReactPressConfig,
): Promise<void> {
  const { envPath, sqlitePath, uploadsDir } = getProjectPaths(projectRoot);
  const existing = (await fs.pathExists(envPath)) ? await loadEnvFile(envPath) : {};

  if (isSqliteMode(config)) {
    const dbFile = config.database.sqlitePath ?? sqlitePath;
    const port = config.server.port;
    const siteUrl =
      config.server.serverUrl ?? config.server.siteUrl ?? `http://127.0.0.1:${port}`;
    const clientUrl = config.server.clientUrl ?? 'http://localhost:3001';
    const merged: EnvMap = {
      ...existing,
      DB_TYPE: 'sqlite',
      DB_DATABASE: dbFile,
      SERVER_PORT: String(port),
      CLIENT_SITE_URL: clientUrl,
      SERVER_SITE_URL: siteUrl,
      SERVER_API_PREFIX: config.server.apiPrefix ?? existing.SERVER_API_PREFIX ?? '/api',
      REACTPRESS_UPLOAD_DIR: existing.REACTPRESS_UPLOAD_DIR ?? uploadsDir,
    };
    await writeEnvFile(envPath, merged);
    return;
  }

  const merged: EnvMap = {
    ...existing,
    DB_TYPE: 'mysql',
    DB_HOST: config.database.host ?? existing.DB_HOST ?? '127.0.0.1',
    DB_PORT: String(config.database.port ?? existing.DB_PORT ?? 3306),
    DB_USER: config.database.user ?? existing.DB_USER ?? 'reactpress',
    DB_PASSWD: config.database.password ?? existing.DB_PASSWD ?? 'reactpress',
    DB_DATABASE: config.database.database ?? existing.DB_DATABASE ?? 'reactpress',
    SERVER_PORT: String(config.server.port),
    CLIENT_SITE_URL: config.server.clientUrl ?? existing.CLIENT_SITE_URL ?? 'http://localhost:3001',
    SERVER_SITE_URL: config.server.serverUrl ?? existing.SERVER_SITE_URL ?? 'http://localhost:3002',
  };
  await writeEnvFile(envPath, merged);
}

export function setConfigValue(
  config: ReactPressConfig,
  keyPath: string,
  value: string,
): ReactPressConfig {
  const parts = keyPath.split('.');
  const clone = structuredClone(config) as unknown as Record<string, unknown>;
  let cursor: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof cursor[part] !== 'object' || cursor[part] === null) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  const numericKeys = new Set(['port', 'version']);
  cursor[last] = numericKeys.has(last) ? Number(value) : value;
  return clone as unknown as ReactPressConfig;
}

export function getConfigValue(config: ReactPressConfig, keyPath: string): string {
  const parts = keyPath.split('.');
  let cursor: unknown = config;
  for (const part of parts) {
    if (typeof cursor !== 'object' || cursor === null) {
      throw new Error(`配置项不存在: ${keyPath}`);
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }
  if (cursor === undefined) {
    throw new Error(`配置项不存在: ${keyPath}`);
  }
  return String(cursor);
}

export function listConfigKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...listConfigKeys(value as Record<string, unknown>, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

export async function isReactPressProject(projectRoot: string): Promise<boolean> {
  const { configPath } = getProjectPaths(projectRoot);
  return fs.pathExists(configPath);
}
