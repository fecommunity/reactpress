import { initLocalProject } from './local-site';

export interface InitProjectOptions {
  directory: string;
  force?: boolean;
  /** @deprecated v4 always uses SQLite */
  local?: boolean;
}

export async function initProject(
  options: InitProjectOptions,
): Promise<{ ok: boolean; projectRoot: string; message: string }> {
  return initLocalProject(options.directory, { force: options.force });
}
