import fs from 'fs-extra';
import { join } from 'node:path';

import type { ReactPressConfig } from '../../types/config';
import { getProjectPaths, getTemplatesDir } from '../utils/paths';
import { saveConfig, syncEnvFromConfig } from './config';
import { ensureDatabase, ensureDatabaseHostPort } from './database';
import { initLocalProject } from './local-site';

export interface InitProjectOptions {
  directory: string;
  force?: boolean;
  local?: boolean;
}

export async function initProject(
  options: InitProjectOptions,
): Promise<{ ok: boolean; projectRoot: string; message: string }> {
  if (options.local) {
    return initLocalProject(options.directory, { force: options.force });
  }

  const projectRoot = options.directory;
  const paths = getProjectPaths(projectRoot);

  if ((await fs.pathExists(paths.configPath)) && !options.force) {
    return {
      ok: false,
      projectRoot,
      message: '目录已是 ReactPress 项目。使用 --force 覆盖配置。',
    };
  }

  await fs.ensureDir(projectRoot);
  await fs.ensureDir(paths.reactpressDir);
  const templatesDir = getTemplatesDir();

  await copyTemplate(join(templatesDir, 'docker-compose.yml'), paths.dockerComposePath);
  await copyTemplate(join(templatesDir, 'package.json'), join(projectRoot, 'package.json'));

  const config = (await fs.readJson(
    join(templatesDir, 'config.default.json'),
  )) as ReactPressConfig;
  await saveConfig(projectRoot, config);
  await syncEnvFromConfig(projectRoot, config);

  if (!(await fs.pathExists(paths.envPath)) || options.force) {
    const envTemplate = await fs.readFile(join(templatesDir, 'env.default'), 'utf8');
    await fs.writeFile(paths.envPath, envTemplate, 'utf8');
    await syncEnvFromConfig(projectRoot, config);
  }

  await ensureDatabaseHostPort(projectRoot, undefined, config);
  const dbResult = await ensureDatabase(projectRoot, config);

  if (!dbResult.ok) {
    return {
      ok: true,
      projectRoot,
      message: `项目已创建，但数据库未就绪: ${dbResult.message}。可稍后运行 reactpress dev。`,
    };
  }

  return {
    ok: true,
    projectRoot,
    message: 'ReactPress 项目初始化完成。运行 reactpress dev 启动服务。',
  };
}

async function copyTemplate(src: string, dest: string): Promise<void> {
  if (!(await fs.pathExists(src))) {
    throw new Error(`模板文件缺失: ${src}`);
  }
  await fs.copy(src, dest, { overwrite: true });
}
