export type InstallLocale = 'zh' | 'en';

/** 与 CLI `resolveLocale()` 一致：REACTPRESS_LANG / LANG，默认 en。 */
export function resolveInstallLocale(raw?: string): InstallLocale {
  const code = String(raw || process.env.REACTPRESS_LANG || process.env.LANG || 'en')
    .split(/[._-]/)[0]
    .toLowerCase();
  return code === 'zh' ? 'zh' : 'en';
}
