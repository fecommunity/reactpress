import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectRoot } from '../../utils/project-root.util';
import { isValidPluginId } from '@fecommunity/reactpress-toolkit/plugin/extension';

export function readPluginsPackageMeta(root = resolveProjectRoot()): { local: string[] } {
  const pkgPath = path.join(root, 'plugins', 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { local: [] };
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      reactpress?: { local?: string[] };
    };
    const local = Array.isArray(pkg.reactpress?.local)
      ? pkg.reactpress.local.filter(
          (id): id is string => typeof id === 'string' && isValidPluginId(id),
        )
      : [];
    return { local };
  } catch {
    return { local: [] };
  }
}
