#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Checking npm login..."
if [[ -z "${NPM_OTP:-}" ]]; then
  echo "    Tip: if publish fails with EOTP, rerun: NPM_OTP=123456 ./scripts/publish-3.7.0.sh"
fi
pnpm whoami --registry https://registry.npmjs.org

echo "==> Building server (security fixes)..."
pnpm run --dir server build

echo "==> Building toolkit..."
pnpm run --dir toolkit build

echo "==> Syncing server into cli bundle..."
node cli/scripts/sync-monorepo-server.mjs

fix_workspace_deps() {
  local pkg_dir="$1"
  local pkg_json="$pkg_dir/package.json"
  node -e "
    const fs = require('fs');
    const p = '$pkg_json';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const key of ['dependencies','devDependencies','peerDependencies']) {
      if (!j[key]) continue;
      for (const [name, val] of Object.entries(j[key])) {
        if (String(val).startsWith('workspace:')) j[key][name] = '3.7.0';
      }
    }
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  "
}

restore_workspace_deps() {
  local pkg_dir="$1"
  local pkg_json="$pkg_dir/package.json"
  node -e "
    const fs = require('fs');
    const p = '$pkg_json';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const key of ['dependencies','devDependencies','peerDependencies']) {
      if (!j[key]) continue;
      for (const name of Object.keys(j[key])) {
        if (j[key][name] === '3.7.0' && name.startsWith('@fecommunity/reactpress')) {
          j[key][name] = 'workspace:*';
        }
      }
    }
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  "
}

publish_pkg() {
  local dir="$1"
  fix_workspace_deps "$dir"
  if [[ -n "${NPM_OTP:-}" ]]; then
    (cd "$dir" && pnpm publish --access public --no-git-checks --registry https://registry.npmjs.org --otp "$NPM_OTP")
  else
    (cd "$dir" && pnpm publish --access public --no-git-checks --registry https://registry.npmjs.org)
  fi
  restore_workspace_deps "$dir"
}

echo "==> Publishing @fecommunity/reactpress-toolkit@3.7.0..."
publish_pkg toolkit

echo "==> Publishing @fecommunity/reactpress-server@3.7.0..."
publish_pkg server

echo "==> Publishing @fecommunity/reactpress@3.7.0..."
publish_pkg cli

echo "==> Done. Verify: npm view @fecommunity/reactpress version"
