import {
  buildPublicSettingView,
  getThemeConfigurationSeed,
  getThemeStateFromGlobalSetting,
  migrateLegacyAppearanceToThemeMods,
  pickSystemSettingPatch,
  resolveEffectiveSettingRow,
} from '@fecommunity/reactpress-toolkit/theme';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as merge from 'deepmerge';
import { Repository } from 'typeorm';

import { i18n, settings } from './setting.constant';
import { Setting } from './setting.entity';

const THEMES_WITH_CONFIGURATION = ['twentytwentyfive'] as const;

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>
  ) {
    this.initI18n();
    this.initGlobalConfig();
    this.migrateLegacyAppearance();
    this.initThemeConfigurations();
  }

  /**
   * 初始化时加载 i18n 配置
   */
  async initI18n() {
    try {
      const items = await this.settingRepository.find();
      const target = (items && items[0]) || ({} as Setting);

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
    const items = await this.settingRepository.find();
    const target = (items && items[0]) || ({} as Setting);
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

  /** 将旧版 Setting 表中的外观字段迁入 `globalSetting.theme.mods`。 */
  async migrateLegacyAppearance() {
    const items = await this.settingRepository.find();
    const target = (items && items[0]) || ({} as Setting);
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
    const items = await this.settingRepository.find();
    const target = (items && items[0]) || ({} as Setting);
    let gs: Record<string, unknown> = {};
    try {
      if (target.globalSetting) {
        gs = JSON.parse(target.globalSetting) as Record<string, unknown>;
      }
    } catch {
      gs = {};
    }

    const themeState = getThemeStateFromGlobalSetting(gs);
    const activeTheme = themeState.activeTheme || 'twentytwentyfive';
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
    const data = await this.settingRepository.find();
    const res = data[0];
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
    const old = await this.settingRepository.find();
    const sanitized = pickSystemSettingPatch(setting as Record<string, unknown>);
    if (Object.keys(sanitized).length === 0) {
      return old[0] ?? ({} as Setting);
    }

    const updatedTag =
      old && old[0]
        ? await this.settingRepository.merge(old[0], sanitized as Partial<Setting>)
        : await this.settingRepository.create(sanitized as Partial<Setting>);
    return this.settingRepository.save(updatedTag);
  }
}
