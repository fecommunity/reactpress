import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectRoot } from '../../utils/project-root.util';
import { isValidPluginId } from '@fecommunity/reactpress-toolkit/plugin/extension';

function scanPluginDirectories(pluginsDir: string): string[] {
  if (!fs.existsSync(pluginsDir)) return [];

  const discovered: string[] = [];
  for (const entry of fs.readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!isValidPluginId(entry.name)) continue;
    if (fs.existsSync(path.join(pluginsDir, entry.name, 'plugin.json'))) {
      discovered.push(entry.name);
    }
  }
  return discovered.sort();
}

export function readPluginsPackageMeta(root = resolveProjectRoot()): { local: string[] } {
  const pluginsDir = path.join(root, 'plugins');
  const pkgPath = path.join(pluginsDir, 'package.json');

  let fromRegistry: string[] = [];
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
        reactpress?: { local?: string[] };
      };
      fromRegistry = Array.isArray(pkg.reactpress?.local)
        ? pkg.reactpress.local.filter(
            (id): id is string => typeof id === 'string' && isValidPluginId(id),
          )
        : [];
    } catch {
      fromRegistry = [];
    }
  }

  const discovered = scanPluginDirectories(pluginsDir);
  const local = [...new Set([...fromRegistry, ...discovered])].sort();
  return { local };
}
