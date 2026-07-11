import {
  buildPublicSettingView,
  getThemeConfigurationSeed,
  getThemeStateFromGlobalSetting,
  migrateLegacyAppearanceToThemeMods,
  pickSystemSettingPatch,
  resolveEffectiveSettingRow,
} from '@fecommunity/reactpress-toolkit/theme';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as merge from 'deepmerge';
import { Repository } from 'typeorm';

import { i18n, settings } from './setting.constant';
import { Setting } from './setting.entity';
import { getSystemSettingSeedDefaults } from '../bootstrap/bootstrap.constants';
import { resolveInstallLocale } from '../bootstrap/install-locale';

const THEMES_WITH_CONFIGURATION = ['reactpress-theme-starter'] as const;

function trimUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

@Injectable()
export class SettingService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    void this.runInitializers();
  }

  private async runInitializers() {
    try {
      await this.initI18n();
      await this.initGlobalConfig();
      await this.initSystemSettings();
      await this.migrateLegacyAppearance();
      await this.initThemeConfigurations();
    } catch (error) {
      console.error('[SettingService] initialization failed:', error);
    }
  }

  /** 保证 Setting 表仅有一行有效配置，避免并发初始化产生空行。 */
  async getSettingRow(): Promise<Setting> {
    return this.ensureSettingRow();
  }

  private settingRowScore(row: Setting): number {
    return (
      (row.globalSetting?.trim() ? 4 : 0) +
      (row.i18n?.trim() ? 2 : 0) +
      (row.systemTitle?.trim() ? 1 : 0)
    );
  }

  private async ensureSettingRow(): Promise<Setting> {
    const items = await this.settingRepository.find({ order: { createAt: 'ASC' } });
    if (items.length === 0) {
      return this.settingRepository.save(this.settingRepository.create({}));
    }
    if (items.length === 1) return items[0];

    const sorted = [...items].sort((a, b) => this.settingRowScore(b) - this.settingRowScore(a));
    const primary = { ...sorted[0] } as Setting;

    for (const row of sorted.slice(1)) {
      for (const key of Object.keys(row) as (keyof Setting)[]) {
        if (key === 'id' || key === 'createAt' || key === 'updateAt') continue;
        const val = row[key];
        const current = primary[key];
        if (val != null && String(val).trim() !== '' && (current == null || String(current).trim() === '')) {
          (primary as unknown as Record<string, unknown>)[key as string] = val;
        }
      }
    }

    const saved = await this.settingRepository.save(primary);
    await this.settingRepository.remove(sorted.slice(1));
    return saved;
  }

  /**
   * 初始化时加载 i18n 配置
   */
  async initI18n() {
    try {
      const target = await this.ensureSettingRow();

      let data = {};
      try {
        if (target.i18n) {
          data = JSON.parse(target.i18n);
        }
      } catch (e) {
        console.warn('[SettingService] Error parsing i18n from DB:', e);
        data = {};
      }

      // Merge default i18n with data from DB
      const mergedI18n = merge({}, i18n, data);

      // Only update if there's a change or if it's empty
      const mergedI18nString = JSON.stringify(mergedI18n);
      if (!target.i18n || target.i18n !== mergedI18nString) {
        target.i18n = mergedI18nString;
        await this.settingRepository.save(target);
        console.log('[SettingService] i18n updated in database');
      } else {
        console.log('[SettingService] i18n already up to date');
      }
    } catch (error) {
      console.error('[SettingService] Error in initI18n:', error);
      throw error;
    }
  }

  /**
   * 初始化时加载 nav 配置
   */
  async initGlobalConfig() {
    const target = await this.ensureSettingRow();
    let data: Record<string, unknown> = {};
    try {
      if (target.globalSetting) {
        data = JSON.parse(target.globalSetting) as Record<string, unknown>;
      }
    } catch {
      data = {};
    }
    const themeState = getThemeStateFromGlobalSetting(data);
    const defaultTheme = getThemeStateFromGlobalSetting(settings);
    const mergedTheme = {
      ...defaultTheme,
      ...themeState,
      mods: { ...defaultTheme.mods, ...themeState.mods },
      installedThemes:
        themeState.installedThemes?.length > 0 ? themeState.installedThemes : defaultTheme.installedThemes,
    };
    const mergedSettings = { ...data, theme: mergedTheme };
    const mergedSettingsString = JSON.stringify(mergedSettings);

    if (!target.globalSetting || target.globalSetting !== mergedSettingsString) {
      target.globalSetting = mergedSettingsString;
      await this.settingRepository.save(target);
    }
  }

  /**
   * 初始化系统内置配置（站点标题、SEO、URL 等），仅填充空字段。
   */
  async initSystemSettings() {
    const locale = resolveInstallLocale(
      this.configService.get('REACTPRESS_LANG') || this.configService.get('LANG'),
    );
    const clientSiteUrl = this.configService.get('CLIENT_SITE_URL', 'http://localhost:3001');
    const urlDefaults = {
      systemUrl: clientSiteUrl,
      adminSystemUrl: `${trimUrl(clientSiteUrl)}/admin/`,
    };

    const target = await this.ensureSettingRow();

    let changed = false;
    const merged = { ...getSystemSettingSeedDefaults(locale), ...urlDefaults };

    for (const [key, defaultValue] of Object.entries(merged)) {
      const current = target[key];
      if (current != null && String(current).trim() !== '') continue;
      target[key] = defaultValue;
      changed = true;
    }

    if (!changed) return;

    await this.settingRepository.save(target);
    console.log(`[SettingService] system settings seeded with built-in defaults (${locale})`);
  }

  /** 将旧版 Setting 表中的外观字段迁入 `globalSetting.theme.mods`。 */
  async migrateLegacyAppearance() {
    const target = await this.ensureSettingRow();
    if (!target.id && !target.globalSetting) return;

    let gs: Record<string, unknown> = {};
    try {
      if (target.globalSetting) {
        gs = JSON.parse(target.globalSetting) as Record<string, unknown>;
      }
    } catch {
      gs = {};
    }

    const { global, changed } = migrateLegacyAppearanceToThemeMods(gs, (target as unknown) as Record<string, unknown>);
    if (changed) {
      target.globalSetting = JSON.stringify(global);
      await this.settingRepository.save(target);
      console.log('[SettingService] legacy appearance migrated to theme mods');
    }
  }

  /**
   * 初始化各主题的 schema 默认配置到 globalSetting.config[themeId]
   */
  async initThemeConfigurations() {
    const target = await this.ensureSettingRow();
    let gs: Record<string, unknown> = {};
    try {
      if (target.globalSetting) {
        gs = JSON.parse(target.globalSetting) as Record<string, unknown>;
      }
    } catch {
      gs = {};
    }

    const themeState = getThemeStateFromGlobalSetting(gs);
    const activeTheme = themeState.activeTheme || 'hello-world';
    const config =
      gs.config && typeof gs.config === 'object'
        ? ({ ...(gs.config as Record<string, Record<string, unknown>>) } as Record<string, Record<string, unknown>>)
        : {};

    let changed = false;
    for (const themeId of THEMES_WITH_CONFIGURATION) {
      const seed = getThemeConfigurationSeed(themeId, 'zh');
      if (!seed) continue;
      const current = config[themeId];
      const merged = merge({}, seed, current && typeof current === 'object' ? current : {});
      const mergedStr = JSON.stringify(merged);
      const prevStr = JSON.stringify(current ?? {});
      if (mergedStr !== prevStr) {
        config[themeId] = merged;
        changed = true;
      }
    }

    if (!gs.config && Object.keys(config).length) {
      changed = true;
    }

    if (changed) {
      gs.config = config;
      target.globalSetting = JSON.stringify(gs);
      await this.settingRepository.save(target);
      console.log(`[SettingService] theme config seeded (active: ${activeTheme})`);
    }
  }

  /**
   *
   * 获取系统设置
   * @param user
   * @param innerInvoke
   * @param isAdmin
   */
  async findAll(innerInvoke = false, isAdmin = false): Promise<Setting> {
    const res = await this.ensureSettingRow().catch(() => null);
    if (!res) {
      return {} as Setting;
    }
    if (isAdmin && !innerInvoke) {
      return res;
    }

    const effective = (resolveEffectiveSettingRow((res as unknown) as Record<string, unknown>) as unknown) as Setting;

    if (innerInvoke) {
      return effective;
    }
    return (buildPublicSettingView((effective as unknown) as Record<string, unknown>) as unknown) as Setting;
  }

  /** 更新系统设置（站点/SEO 为全站默认，主题 customizer 可覆盖） */
  async update(setting: Partial<Setting>): Promise<Setting> {
    const old = await this.ensureSettingRow();
    const sanitized = pickSystemSettingPatch(setting as Record<string, unknown>);
    if ('smtpPass' in sanitized && !String(sanitized.smtpPass ?? '').trim()) {
      delete sanitized.smtpPass;
    }
    if (Object.keys(sanitized).length === 0) {
      return old ?? ({} as Setting);
    }

    const updatedTag = await this.settingRepository.merge(old, sanitized as Partial<Setting>);
    return this.settingRepository.save(updatedTag);
  }
}
