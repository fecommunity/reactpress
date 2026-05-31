import * as fs from 'fs';
import * as path from 'path';

/** User project root (contains `themes/`, `.env`, etc.). */
export function resolveProjectRoot(): string {
  if (process.env.REACTPRESS_ORIGINAL_CWD) {
    return process.env.REACTPRESS_ORIGINAL_CWD;
  }

  let dir = process.cwd();
  for (let depth = 0; depth < 8; depth += 1) {
    if (fs.existsSync(path.join(dir, 'themes'))) {
      process.env.REACTPRESS_ORIGINAL_CWD = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return process.cwd();
}
