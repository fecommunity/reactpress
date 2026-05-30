export function getSiteTitle(setting: Pick<ISetting, 'systemTitle' | 'systemSubTitle'>) {
  const main = setting.systemTitle || 'ReactPress';
  return setting.systemSubTitle ? `${main} - ${setting.systemSubTitle}` : main;
}

export function getPageTitle(pageTitle: string, setting: Pick<ISetting, 'systemTitle'>) {
  const site = setting.systemTitle || 'ReactPress';
  return `${pageTitle} - ${site}`;
}
