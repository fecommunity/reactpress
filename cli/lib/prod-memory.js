/**
 * Optional production memory tuning — only active when REACTPRESS_LOW_MEM=1.
 * Default deploy does not set this; all limits stay at normal Node/PM2 defaults.
 */

function isLowMemMode() {
  return process.env.REACTPRESS_LOW_MEM === '1';
}

/** Apply heap cap only when low-mem or explicitly configured. */
function resolveBuildMaxOldSpaceMb() {
  const fromEnv = parseInt(process.env.REACTPRESS_BUILD_MAX_OLD_SPACE_MB || '', 10);
  if (Number.isInteger(fromEnv) && fromEnv >= 256) return fromEnv;
  if (isLowMemMode()) return 768;
  return null;
}

function resolveBuildNodeEnv(baseEnv = process.env) {
  const mb = resolveBuildMaxOldSpaceMb();
  if (!mb) return { ...baseEnv };
  const flag = `--max-old-space-size=${mb}`;
  const existing = baseEnv.NODE_OPTIONS || '';
  if (existing.includes('max-old-space-size')) {
    return { ...baseEnv };
  }
  return {
    ...baseEnv,
    NODE_OPTIONS: existing ? `${existing} ${flag}` : flag,
  };
}

function getPm2ServerMemoryRestart() {
  if (process.env.REACTPRESS_PM2_SERVER_MEMORY) {
    return process.env.REACTPRESS_PM2_SERVER_MEMORY;
  }
  if (isLowMemMode()) return '384M';
  return '1G';
}

function getPm2ClientMemoryRestart() {
  if (process.env.REACTPRESS_PM2_CLIENT_MEMORY) {
    return process.env.REACTPRESS_PM2_CLIENT_MEMORY;
  }
  if (isLowMemMode()) return '512M';
  return '1G';
}

module.exports = {
  isLowMemMode,
  resolveBuildMaxOldSpaceMb,
  resolveBuildNodeEnv,
  getPm2ServerMemoryRestart,
  getPm2ClientMemoryRestart,
};
