export interface SiteTitleSource {
  systemTitle?: string;
  systemSubTitle?: string;
}

export function getSiteTitle(setting: SiteTitleSource, fallback = 'ReactPress'): string {
  const main = setting.systemTitle || fallback;
  return setting.systemSubTitle ? `${main} - ${setting.systemSubTitle}` : main;
}

export function getPageTitle(
  pageTitle: string,
  setting: Pick<SiteTitleSource, 'systemTitle'>,
  fallback = 'ReactPress',
): string {
  const site = setting.systemTitle || fallback;
  return `${pageTitle} - ${site}`;
}
