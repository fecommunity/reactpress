const fs = require('fs');
const path = require('path');

const { loadClientSiteUrl, loadServerSiteUrl, getApiPrefix } = require('./http');

function parseEnvFile(content) {
  const out = {};
  for (const line of String(content).split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function readProjectEnv(projectRoot) {
  const envPath = path.join(path.resolve(projectRoot), '.env');
  if (!fs.existsSync(envPath)) return {};
  try {
    return parseEnvFile(fs.readFileSync(envPath, 'utf8'));
  } catch {
    return {};
  }
}

function buildThemeEnvOverrides(projectRoot, projectEnv = readProjectEnv(projectRoot)) {
  const clientSiteUrl = (
    projectEnv.CLIENT_SITE_URL || loadClientSiteUrl(projectRoot)
  ).replace(/\/$/, '');
  const serverSiteUrl = (
    projectEnv.SERVER_SITE_URL || loadServerSiteUrl(projectRoot)
  ).replace(/\/$/, '');
  const apiPrefix = projectEnv.SERVER_API_PREFIX || getApiPrefix(projectRoot) || '/api';
  const normalizedPrefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  const apiUrl =
    projectEnv.REACTPRESS_API_URL || `${serverSiteUrl}${normalizedPrefix}`.replace(/\/$/, '');

  const publicApiUrl =
    projectEnv.NEXT_PUBLIC_REACTPRESS_API_URL ||
    projectEnv.REACTPRESS_THEME_PUBLIC_API_URL ||
    apiUrl;

  const adminUrl =
    projectEnv.NEXT_PUBLIC_REACTPRESS_ADMIN_URL ||
    projectEnv.WEB_ADMIN_URL ||
    'http://localhost:3000';

  return {
    REACTPRESS_API_URL: apiUrl,
    SERVER_API_URL: apiUrl,
    NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
    CLIENT_SITE_URL: clientSiteUrl,
    NEXT_PUBLIC_REACTPRESS_ADMIN_URL: adminUrl.replace(/\/$/, ''),
  };
}

function upsertEnvLines(existingContent, overrides) {
  const lines = existingContent.split('\n');
  for (const [key, value] of Object.entries(overrides)) {
    if (value == null || value === '') continue;
    const entry = `${key}=${value}`;
    const index = lines.findIndex((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && trimmed.startsWith(`${key}=`);
    });
    if (index >= 0) {
      lines[index] = entry;
    } else {
      lines.push(entry);
    }
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * Point an installed theme's `.env` at the host ReactPress project API URLs.
 */
function syncThemeEnvFromProject(projectRoot, themeDir) {
  const root = path.resolve(projectRoot);
  const dir = path.resolve(themeDir);
  const overrides = buildThemeEnvOverrides(root);
  const envPath = path.join(dir, '.env');
  const examplePath = path.join(dir, '.env.example');

  let base = '';
  if (fs.existsSync(envPath)) {
    base = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(examplePath)) {
    base = fs.readFileSync(examplePath, 'utf8');
  }

  const next = upsertEnvLines(base, overrides);
  fs.writeFileSync(envPath, next, 'utf8');
  return envPath;
}

module.exports = {
  buildThemeEnvOverrides,
  readProjectEnv,
  syncThemeEnvFromProject,
};
