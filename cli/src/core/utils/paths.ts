import { join } from 'node:path';

export const CONFIG_DIR = '.reactpress';
export const CONFIG_FILE = 'config.json';
export const PID_FILE = 'server.pid';
export const ENV_FILE = '.env';

/** CLI 包根目录（编译后位于 out/core/utils → ../../../） */
export function getPackageRoot(): string {
  return join(__dirname, '..', '..', '..');
}

export function getTemplatesDir(): string {
  return join(getPackageRoot(), 'templates');
}

export interface ProjectPaths {
  projectRoot: string;
  reactpressDir: string;
  configPath: string;
  pidPath: string;
  envPath: string;
  dockerComposePath: string;
  dbDataDir: string;
  sqlitePath: string;
  uploadsDir: string;
}

export function getProjectPaths(projectRoot: string): ProjectPaths {
  const reactpressDir = join(projectRoot, CONFIG_DIR);
  const dataDir = join(projectRoot, 'data');
  return {
    projectRoot,
    reactpressDir,
    configPath: join(reactpressDir, CONFIG_FILE),
    pidPath: join(reactpressDir, PID_FILE),
    envPath: join(projectRoot, ENV_FILE),
    dockerComposePath: join(reactpressDir, 'docker-compose.yml'),
    dbDataDir: join(reactpressDir, 'data'),
    sqlitePath: join(dataDir, 'reactpress.db'),
    uploadsDir: join(projectRoot, 'uploads'),
  };
}
