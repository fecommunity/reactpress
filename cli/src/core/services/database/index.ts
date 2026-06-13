import fs from 'fs-extra';

import type {
  DatabaseEnsureResult,
  MysqlCredentials,
  ReactPressConfig,
} from '../../../types/config';
import { getDockerComposeCommand } from '../../utils/platform';
import { getProjectPaths } from '../../utils/paths';
import { findAvailablePort, isDockerPortBindError, isPortAvailable } from '../../utils/port';
import { isDockerAvailable, runSync, sleep } from '../exec';
import { isSqliteMode, loadConfig, loadEnvFile, saveConfig, syncEnvFromConfig } from '../config';
import {
  getDatabaseCredentials,
  testMysqlConnection,
  waitForMysql,
} from './mysql';
import { ensureSqliteDatabase, isSqliteReady } from './sqlite';

export { getDatabaseCredentials, testMysqlConnection as testDatabaseConnection } from './mysql';
export { ensureSqliteDatabase, probeSqliteDatabase, isSqliteReady } from './sqlite';
export { resolveDatabaseProfile, requiresDocker, isLocalDatabaseMode } from './profile';

const DEFAULT_DB_HOST_PORT = 3306;
const EMBEDDED_DB_ROOT_PASSWORD = 'reactpress_root';

export async function waitForDatabase(
  creds: MysqlCredentials,
  maxAttempts = 40,
  intervalMs = 1000,
): Promise<boolean> {
  return waitForMysql(creds, maxAttempts, intervalMs);
}

export function parseDockerPublishedPort(output: string): number | null {
  for (const line of output.split('\n')) {
    const match = line.trim().match(/:(\d+)\s*$/);
    if (match) return Number(match[1]);
  }
  return null;
}

export async function getContainerPublishedHostPort(
  containerName: string,
  containerPort = 3306,
): Promise<number | null> {
  if (!isDockerAvailable()) return null;
  const result = runSync('docker', ['port', containerName, `${containerPort}/tcp`], {
    silent: true,
  });
  if (!result.ok || !result.stdout.trim()) return null;
  return parseDockerPublishedPort(result.stdout);
}

async function persistDatabaseHostPort(
  projectRoot: string,
  config: ReactPressConfig,
  port: number,
): Promise<void> {
  const { configPath, envPath } = getProjectPaths(projectRoot);
  config.database.port = port;
  if (await fs.pathExists(configPath)) {
    await saveConfig(projectRoot, config);
  }
  if (await fs.pathExists(envPath)) {
    await syncEnvFromConfig(projectRoot, config);
  }
}

async function isContainerHealthy(containerName: string): Promise<boolean> {
  const result = runSync(
    'docker',
    [
      'inspect',
      '-f',
      '{{if .State.Health}}{{.State.Health.Status}}{{else}}healthy{{end}}',
      containerName,
    ],
    { silent: true },
  );
  if (!result.ok) return false;
  return result.stdout.trim() === 'healthy';
}

async function buildConnectionFailureMessage(
  projectRoot: string,
  config: ReactPressConfig,
  creds: MysqlCredentials,
): Promise<string> {
  const containerName = config.database.containerName ?? 'reactpress_cli_db';
  const published = await getContainerPublishedHostPort(containerName);
  const port = published ?? creds.port;
  const rootReachable = await testMysqlConnection({
    host: creds.host,
    port,
    user: 'root',
    password: EMBEDDED_DB_ROOT_PASSWORD,
    database: creds.database,
  });
  const healthy = await isContainerHealthy(containerName);
  if (rootReachable && healthy) {
    return (
      `数据库容器已在端口 ${port} 运行，但账号「${creds.user}」无法连接（数据卷中的凭证与 .env 不一致）。` +
      ` 请在项目目录执行: cd .reactpress && docker compose down -v && cd .. && reactpress start`
    );
  }
  return `数据库容器已启动，但连接超时。请执行 docker logs ${containerName} 查看详情。`;
}

export async function ensureDatabaseHostPort(
  projectRoot: string,
  forcePort?: number,
  configOverride?: ReactPressConfig,
): Promise<{ port: number; changed: boolean; previousPort: number }> {
  const config = configOverride ?? (await loadConfig(projectRoot));
  if (isSqliteMode(config)) {
    const port = config.server.port ?? DEFAULT_DB_HOST_PORT;
    return { port, changed: false, previousPort: port };
  }
  if (config.database.mode !== 'embedded-docker') {
    const port = config.database.port ?? DEFAULT_DB_HOST_PORT;
    return { port, changed: false, previousPort: port };
  }

  const { envPath } = getProjectPaths(projectRoot);
  const existing = (await fs.pathExists(envPath)) ? await loadEnvFile(envPath) : {};
  const currentPort = Number(existing.DB_PORT ?? config.database.port ?? DEFAULT_DB_HOST_PORT);
  const containerName = config.database.containerName ?? 'reactpress_cli_db';
  const containerPort = await getContainerPublishedHostPort(containerName);

  if (containerPort !== null && !forcePort) {
    if (containerPort !== currentPort) {
      await persistDatabaseHostPort(projectRoot, config, containerPort);
      return { port: containerPort, changed: true, previousPort: currentPort };
    }
    return { port: containerPort, changed: false, previousPort: currentPort };
  }

  if (!forcePort && (await isPortAvailable(currentPort))) {
    return { port: currentPort, changed: false, previousPort: currentPort };
  }

  if (!forcePort && !(await isPortAvailable(currentPort))) {
    const creds = await getDatabaseCredentials(projectRoot);
    if (await testMysqlConnection({ ...creds, port: currentPort })) {
      return { port: currentPort, changed: false, previousPort: currentPort };
    }
  }

  let port: number;
  if (forcePort && (await isPortAvailable(forcePort))) {
    port = forcePort;
  } else {
    const start =
      forcePort ??
      (currentPort === DEFAULT_DB_HOST_PORT ? DEFAULT_DB_HOST_PORT + 1 : currentPort + 1);
    port = await findAvailablePort(start);
  }

  if (currentPort === port && config.database.port === port) {
    return { port, changed: false, previousPort: currentPort };
  }

  await persistDatabaseHostPort(projectRoot, config, port);
  return { port, changed: true, previousPort: currentPort };
}

async function getDockerComposeEnv(projectRoot: string): Promise<Record<string, string>> {
  const creds = await getDatabaseCredentials(projectRoot);
  return {
    DB_PORT: String(creds.port),
    DB_USER: creds.user,
    DB_PASSWD: creds.password,
    DB_DATABASE: creds.database,
    MYSQL_ROOT_PASSWORD: EMBEDDED_DB_ROOT_PASSWORD,
  };
}

function runDockerCompose(
  composeFile: string,
  cwd: string,
  subcommand: string[],
  env: Record<string, string>,
) {
  const composeV2 = runSync('docker', ['compose', 'version'], { silent: true });
  if (composeV2.ok) {
    return runSync('docker', ['compose', '-f', composeFile, ...subcommand], {
      cwd,
      silent: true,
      env,
    });
  }
  return runSync(getDockerComposeCommand(), ['-f', composeFile, ...subcommand], {
    cwd,
    silent: true,
    env,
  });
}

export async function startEmbeddedDatabase(
  projectRoot: string,
  config: ReactPressConfig,
): Promise<DatabaseEnsureResult> {
  if (isSqliteMode(config)) {
    return ensureSqliteDatabase(projectRoot);
  }
  if (config.database.mode !== 'embedded-docker') {
    return { ok: true };
  }
  if (!isDockerAvailable()) {
    return {
      ok: false,
      message:
        '未检测到 Docker。请安装并启动 Docker，或将 database.mode 设为 external / embedded-sqlite。',
    };
  }

  const { dockerComposePath, reactpressDir } = getProjectPaths(projectRoot);
  const maxPortRetries = 5;

  for (let attempt = 0; attempt < maxPortRetries; attempt++) {
    const { port, changed, previousPort } = await ensureDatabaseHostPort(
      projectRoot,
      undefined,
      config,
    );
    if (changed) {
      console.warn(`[reactpress] 宿主机端口 ${previousPort} 已被占用，已改用 ${port}（已更新 .env）`);
    }
    const composeEnv = await getDockerComposeEnv(projectRoot);
    const result = runDockerCompose(dockerComposePath, reactpressDir, ['up', '-d'], composeEnv);
    if (result.ok) break;

    const output = `${result.stderr}\n${result.stdout}`;
    if (isDockerPortBindError(output) && attempt < maxPortRetries - 1) {
      await ensureDatabaseHostPort(projectRoot, port + 1, config);
      console.warn(`[reactpress] 端口 ${port} 绑定失败，正在尝试其他端口…`);
      continue;
    }
    return { ok: false, message: `启动数据库容器失败: ${result.stderr || result.stdout}` };
  }

  const creds = await getDatabaseCredentials(projectRoot);
  const ready = await waitForDatabase(creds);
  if (!ready) {
    return {
      ok: false,
      message: await buildConnectionFailureMessage(projectRoot, config, creds),
    };
  }
  return { ok: true };
}

export async function stopEmbeddedDatabase(
  projectRoot: string,
  config: ReactPressConfig,
): Promise<void> {
  if (config.database.mode !== 'embedded-docker') return;
  if (!isDockerAvailable()) return;
  const { dockerComposePath, reactpressDir } = getProjectPaths(projectRoot);
  const composeEnv = await getDockerComposeEnv(projectRoot);
  runDockerCompose(dockerComposePath, reactpressDir, ['down'], composeEnv);
}

export async function ensureDatabase(
  projectRoot: string,
  config: ReactPressConfig,
): Promise<DatabaseEnsureResult> {
  if (isSqliteMode(config)) {
    return ensureSqliteDatabase(projectRoot);
  }

  const creds = await getDatabaseCredentials(projectRoot);
  if (await testMysqlConnection(creds)) {
    return { ok: true };
  }
  if (config.database.mode === 'embedded-docker') {
    return startEmbeddedDatabase(projectRoot, config);
  }
  return {
    ok: false,
    message: `无法连接数据库 ${creds.host}:${creds.port}，请检查 .env 中的 DB_* 配置。`,
  };
}

export async function isDatabaseReady(projectRoot: string): Promise<boolean> {
  const config = await loadConfig(projectRoot);
  if (isSqliteMode(config)) {
    return isSqliteReady(projectRoot);
  }
  const creds = await getDatabaseCredentials(projectRoot);
  return testMysqlConnection(creds);
}
