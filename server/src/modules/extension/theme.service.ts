import type {
  SiteThemeState,
  ThemeAdminLocaleMessages,
  ThemeConfigurationSchema,
  ThemeManifest,
  ThemeMods,
} from '@fecommunity/reactpress-toolkit/theme';
import {
  defaultSiteThemeState,
  getConfigurationSchemaFromManifest,
  getMergedThemeConfiguration,
  getThemeConfigurationSeed,
  getThemeStateFromGlobalSetting,
  mergeConfigIntoGlobalSetting,
  mergeThemeStateIntoGlobalSetting,
  parseThemeManifest,
  validateAndMergeThemeConfiguration,
  validateThemeConfiguration,
} from '@fecommunity/reactpress-toolkit/theme';
import { readThemeAdminLocaleFile } from '@fecommunity/reactpress-toolkit/theme/node';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Setting } from '../setting/setting.entity';
import { getPreviewDraft, putPreviewDraft } from './preview-draft.store';

export interface ThemeListItem extends ThemeManifest {
  source: 'starter' | 'installed';
  installed: boolean;
  active: boolean;
  coverUrl?: string;
}

export type ThemePreviewSessionResult = SiteThemeState & {
  siteUrl: string;
  /** Separate dev URL when preview theme ≠ active (e.g. http://localhost:3003/). */
  previewSiteUrl?: string;
};

function projectRoot(): string {
  return process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();
}

const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
/** Ephemeral installed copies — under .reactpress/ with active-theme.json */
const THEME_RUNTIME_REL = path.join('.reactpress', 'runtime');
const LEGACY_THEMES_RUNTIME_REL = path.join('themes', 'runtime');
const THEMES_RESERVED_SUBDIRS = new Set(['starter', 'bundled', 'core']);
const THEMES_LEGACY_STARTER_SUBDIRS = ['starter', 'bundled', 'core'];

@Injectable()
export class ThemeService {
  private static readonly COPY_SKIP_NAMES = new Set([
    'node_modules',
    '.next',
    '.git',
    'dist',
    '.turbo',
    'coverage',
    '.reactpress',
    '.cache',
    'package-lock.json',
  ]);

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  private themesRoot(): string {
    return path.join(projectRoot(), 'themes');
  }

  private templatesDir(): string {
    return this.themesRoot();
  }

  private runtimeDir(): string {
    return path.join(projectRoot(), THEME_RUNTIME_REL);
  }

  private legacyStarterDirs(): string[] {
    return THEMES_LEGACY_STARTER_SUBDIRS.map((name) => path.join(this.themesRoot(), name));
  }

  private legacyBundledDir(): string {
    return path.join(projectRoot(), 'templates');
  }

  /** Runtime copies may lag behind templates — keep appearance schema in sync for admin UI. */
  private applyTemplateAppearanceSchema(manifest: ThemeManifest): ThemeManifest {
    const templatePath = path.join(this.templatesDir(), manifest.id);
    const template = this.readManifest(templatePath);
    if (!template) return manifest;
    let next = manifest;
    if (template.appearance?.sections?.length) {
      next = { ...next, appearance: template.appearance };
    }
    if (template.options) {
      next = { ...next, options: template.options };
    }
    return next;
  }

  private readManifest(themeDir: string): ThemeManifest | null {
    const manifestPath = path.join(themeDir, 'theme.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const parsed = parseThemeManifest(raw);
      if (parsed) return parsed;
      if (raw && typeof raw.id === 'string') {
        return parseThemeManifest({ ...raw, id: raw.id });
      }
      const id = path.basename(themeDir);
      return parseThemeManifest({ id, name: id, version: '1.0.0', ...raw });
    } catch {
      return null;
    }
  }

  private listDirThemes(
    dir: string,
    source: 'starter' | 'installed',
    options?: { skipDirNames?: Set<string> },
  ): ThemeManifest[] {
    if (!fs.existsSync(dir)) return [];
    const skip = options?.skipDirNames;
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !(skip && skip.has(d.name)))
      .map((d) => this.readManifest(path.join(dir, d.name)))
      .filter((m): m is ThemeManifest => m !== null);
  }

  private async getSettingRow(): Promise<Setting> {
    const rows = await this.settingRepository.find();
    if (rows[0]) return rows[0];
    const created = this.settingRepository.create({});
    return this.settingRepository.save(created);
  }

  private parseGlobalSetting(row: Setting): Record<string, unknown> {
    if (!row.globalSetting) return {};
    try {
      return JSON.parse(row.globalSetting) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  async getThemeState(): Promise<SiteThemeState> {
    const row = await this.getSettingRow();
    return getThemeStateFromGlobalSetting(this.parseGlobalSetting(row));
  }

  private async saveThemeState(patch: Partial<SiteThemeState>): Promise<SiteThemeState> {
    const row = await this.getSettingRow();
    const merged = mergeThemeStateIntoGlobalSetting(this.parseGlobalSetting(row), patch);
    row.globalSetting = JSON.stringify(merged);
    await this.settingRepository.save(row);
    return merged.theme as SiteThemeState;
  }

  async listThemes(): Promise<ThemeListItem[]> {
    const state = await this.getThemeState();
    const installedSet = new Set(state.installedThemes);
    const byId = new Map<string, ThemeListItem>();

    const add = (manifest: ThemeManifest, source: 'starter' | 'installed') => {
      const installed = installedSet.has(manifest.id) || source === 'installed';
      const merged = this.applyTemplateAppearanceSchema(manifest);
      byId.set(merged.id, {
        ...merged,
        source,
        installed,
        active: state.activeTheme === merged.id,
        coverUrl: `/api/extension/themes/${merged.id}/cover`,
      });
    };

    for (const m of this.listDirThemes(this.templatesDir(), 'starter', {
      skipDirNames: THEMES_RESERVED_SUBDIRS,
    })) {
      add(m, 'starter');
    }
    for (const m of this.listDirThemes(this.runtimeDir(), 'installed')) {
      add(m, 'installed');
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTheme(id: string): Promise<ThemeListItem> {
    const items = await this.listThemes();
    const found = items.find((t) => t.id === id);
    if (!found) throw new NotFoundException(`Theme "${id}" not found`);
    return found;
  }

  /** Customizer copy from `themes/{id}/locales/{locale}.json`. */
  async getThemeAdminLocale(
    themeId: string,
    locale: string,
  ): Promise<{ themeId: string; locale: string; messages: ThemeAdminLocaleMessages }> {
    if (!this.isValidThemeId(themeId)) {
      throw new BadRequestException(`Invalid theme id "${themeId}"`);
    }
    const dirs = this.themeLocaleSearchDirs(themeId);
    if (dirs.length === 0) {
      throw new NotFoundException(`Theme "${themeId}" not found`);
    }

    const safeLocale = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale) ? locale : 'en';
    for (const dir of dirs) {
      const messages = readThemeAdminLocaleFile(dir, safeLocale);
      if (messages) {
        return { themeId, locale: safeLocale, messages };
      }
    }

    return { themeId, locale: safeLocale, messages: {} };
  }

  /** Prefer bundled template copy over ephemeral runtime install. */
  private themeLocaleSearchDirs(themeId: string): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];
    const push = (dir: string | null) => {
      if (!dir || seen.has(dir)) return;
      seen.add(dir);
      ordered.push(dir);
    };

    const template = path.join(this.templatesDir(), themeId);
    if (
      fs.existsSync(template) &&
      !THEMES_RESERVED_SUBDIRS.has(themeId) &&
      this.isUnderDir(template, this.templatesDir())
    ) {
      push(template);
    }
    push(this.resolveThemeDir(themeId));
    return ordered;
  }

  private getThemeManifestForConfig(themeId: string): ThemeManifest | null {
    const dir = this.resolveThemeDir(themeId);
    if (!dir) return null;
    return this.applyTemplateAppearanceSchema(this.readManifest(dir) as ThemeManifest);
  }

  async getThemeConfigurationSchema(themeId: string): Promise<{
    themeId: string;
    schema: ThemeConfigurationSchema | null;
  }> {
    if (!this.isValidThemeId(themeId)) {
      throw new BadRequestException(`Invalid theme id "${themeId}"`);
    }
    const manifest = this.getThemeManifestForConfig(themeId);
    if (!manifest) throw new NotFoundException(`Theme "${themeId}" not found`);
    const schema = getConfigurationSchemaFromManifest(manifest, themeId);
    return { themeId, schema };
  }

  async getThemeConfiguration(themeId: string): Promise<{
    themeId: string;
    configuration: Record<string, unknown>;
  }> {
    if (!this.isValidThemeId(themeId)) {
      throw new BadRequestException(`Invalid theme id "${themeId}"`);
    }
    const manifest = this.getThemeManifestForConfig(themeId);
    if (!manifest) throw new NotFoundException(`Theme "${themeId}" not found`);
    const row = await this.getSettingRow();
    const configuration = getMergedThemeConfiguration(this.parseGlobalSetting(row), themeId, {
      manifest,
    });
    return { themeId, configuration };
  }

  async updateThemeConfiguration(
    themeId: string,
    patch: Record<string, unknown>,
    options?: { replace?: boolean; locale?: string },
  ): Promise<{ themeId: string; configuration: Record<string, unknown> }> {
    if (!this.isValidThemeId(themeId)) {
      throw new BadRequestException(`Invalid theme id "${themeId}"`);
    }
    const manifest = this.getThemeManifestForConfig(themeId);
    if (!manifest) throw new NotFoundException(`Theme "${themeId}" not found`);
    const schema = getConfigurationSchemaFromManifest(manifest, themeId);
    if (!schema) {
      throw new BadRequestException(`Theme "${themeId}" does not declare options schema`);
    }

    const row = await this.getSettingRow();
    const globalRaw = this.parseGlobalSetting(row);
    const locale = options?.locale ?? 'zh';

    if (options?.replace) {
      const seed =
        getThemeConfigurationSeed(themeId, locale) ??
        getMergedThemeConfiguration(globalRaw, themeId, { locale, manifest });
      const validation = validateThemeConfiguration(schema, seed);
      if (!validation.valid) {
        throw new BadRequestException(validation.message ?? 'Invalid configuration');
      }
      const mergedGlobal = mergeConfigIntoGlobalSetting(globalRaw, themeId, seed);
      row.globalSetting = JSON.stringify(mergedGlobal);
      await this.settingRepository.save(row);
      return { themeId, configuration: seed };
    }

    const result = validateAndMergeThemeConfiguration(themeId, globalRaw, patch, manifest);
    if (!result.ok) {
      throw new BadRequestException('message' in result ? result.message : 'Invalid configuration');
    }

    const mergedGlobal = mergeConfigIntoGlobalSetting(globalRaw, themeId, result.config);
    row.globalSetting = JSON.stringify(mergedGlobal);
    await this.settingRepository.save(row);
    return { themeId, configuration: result.config };
  }

  private isValidThemeId(id: string): boolean {
    return typeof id === 'string' && THEME_ID_RE.test(id) && id.length <= 64;
  }

  private isUnderDir(target: string, base: string): boolean {
    const rel = path.relative(path.resolve(base), path.resolve(target));
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
  }

  private isSafeThemeDirRel(themeDirRel: string | null): boolean {
    if (themeDirRel == null) return true;
    if (themeDirRel.includes('..') || path.isAbsolute(themeDirRel)) return false;

    if (themeDirRel.startsWith(`${THEME_RUNTIME_REL}/`)) {
      return true;
    }

    if (themeDirRel.startsWith(`${LEGACY_THEMES_RUNTIME_REL}/`)) {
      return true;
    }

    if (themeDirRel.startsWith('themes/') && !themeDirRel.startsWith(`${LEGACY_THEMES_RUNTIME_REL}/`)) {
      const rest = themeDirRel.slice('themes/'.length);
      const top = rest.split('/')[0];
      if (top && !THEMES_RESERVED_SUBDIRS.has(top)) {
        return true;
      }
    }

    const legacyPrefixes = THEMES_LEGACY_STARTER_SUBDIRS.map((name) => `themes/${name}/`);
    if (legacyPrefixes.some((prefix) => themeDirRel.startsWith(prefix))) {
      return true;
    }

    return themeDirRel.startsWith('templates/');
  }

  private resolveThemeDir(id: string): string | null {
    if (!this.isValidThemeId(id)) return null;

    const runtime = path.join(this.runtimeDir(), id);
    if (fs.existsSync(runtime) && this.isUnderDir(runtime, this.runtimeDir())) {
      return runtime;
    }

    const legacyRuntimeRoot = path.join(projectRoot(), LEGACY_THEMES_RUNTIME_REL);
    const legacyRuntime = path.join(legacyRuntimeRoot, id);
    if (fs.existsSync(legacyRuntime) && this.isUnderDir(legacyRuntime, legacyRuntimeRoot)) {
      return legacyRuntime;
    }

    const template = path.join(this.templatesDir(), id);
    if (
      fs.existsSync(template) &&
      !THEMES_RESERVED_SUBDIRS.has(id) &&
      this.isUnderDir(template, this.templatesDir())
    ) {
      return template;
    }

    for (const legacyStarter of this.legacyStarterDirs()) {
      const legacy = path.join(legacyStarter, id);
      if (fs.existsSync(legacy) && this.isUnderDir(legacy, legacyStarter)) {
        return legacy;
      }
    }

    const legacyBundled = path.join(this.legacyBundledDir(), id);
    if (fs.existsSync(legacyBundled) && this.isUnderDir(legacyBundled, this.legacyBundledDir())) {
      return legacyBundled;
    }

    return null;
  }

  async installTheme(id: string): Promise<SiteThemeState> {
    if (!this.isValidThemeId(id)) {
      throw new BadRequestException(`Invalid theme id "${id}"`);
    }
    const templatePath = path.join(this.templatesDir(), id);
    if (!fs.existsSync(templatePath) || THEMES_RESERVED_SUBDIRS.has(id)) {
      throw new NotFoundException(`Theme template "${id}" not found`);
    }
    const targetDir = path.join(this.runtimeDir(), id);
    fs.mkdirSync(this.runtimeDir(), { recursive: true });
    if (fs.existsSync(targetDir)) {
      this.removeDir(targetDir);
    }
    this.copyDir(templatePath, targetDir);
    this.linkTemplateNodeModules(templatePath, targetDir);
    this.ensureRuntimeThemeTsconfigBase();

    const state = await this.getThemeState();
    const installedThemes = state.installedThemes.includes(id)
      ? state.installedThemes
      : [...state.installedThemes, id];
    return this.saveThemeState({ installedThemes });
  }

  private writeThemeDevManifest(
    fileName: 'active-theme.json' | 'preview-theme.json',
    themeId: string,
  ): void {
    if (!this.isValidThemeId(themeId)) return;
    const themeDir = this.resolveThemeDir(themeId);
    const manifestDir = path.join(projectRoot(), '.reactpress');
    const manifestPath = path.join(manifestDir, fileName);
    const themeDirRel = themeDir ? path.relative(projectRoot(), themeDir) : null;

    if (!this.isSafeThemeDirRel(themeDirRel)) return;

    if (fs.existsSync(manifestPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
          activeTheme?: string;
          themeDir?: string | null;
        };
        if (existing.activeTheme === themeId && existing.themeDir === themeDirRel) {
          return;
        }
      } catch {
        // fall through and rewrite corrupt manifest
      }
    }

    fs.mkdirSync(manifestDir, { recursive: true });
    const payload = {
      activeTheme: themeId,
      themeDir: themeDirRel,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2), 'utf8');
  }

  private syncActiveThemeManifest(themeId: string): void {
    this.writeThemeDevManifest('active-theme.json', themeId);
  }

  /** Themes under `.reactpress/runtime/*` extend `../tsconfig.base.json`. */
  private ensureRuntimeThemeTsconfigBase(): void {
    const baseSrc = path.join(projectRoot(), 'tsconfig.base.json');
    if (!fs.existsSync(baseSrc)) return;
    const runtimeBase = path.join(this.runtimeDir(), 'tsconfig.base.json');
    fs.mkdirSync(this.runtimeDir(), { recursive: true });
    fs.copyFileSync(baseSrc, runtimeBase);
  }

  /** Production: rebuild active theme and restart PM2 visitor after admin activation. */
  private scheduleProductionClientRestart(): void {
    if (process.env.NODE_ENV !== 'production') return;
    if (process.env.REACTPRESS_SKIP_CLIENT_RESTART === '1') return;

    const root = projectRoot();
    const cliBin = path.join(root, 'cli', 'bin', 'reactpress.js');
    if (!fs.existsSync(cliBin)) return;

    const child = spawn(process.execPath, [cliBin, 'client', 'restart', '--pm2'], {
      cwd: root,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, REACTPRESS_ORIGINAL_CWD: root },
    });
    child.unref();
  }

  /** Isolated dev manifest for admin preview — must not touch active-theme.json. */
  private syncPreviewThemeManifest(themeId: string): void {
    this.writeThemeDevManifest('preview-theme.json', themeId);
  }

  private clearPreviewThemeManifest(): void {
    const manifestPath = path.join(projectRoot(), '.reactpress', 'preview-theme.json');
    if (fs.existsSync(manifestPath)) {
      fs.unlinkSync(manifestPath);
    }
  }

  private resolvePreviewSiteUrl(siteUrl: string): string {
    const previewPort = process.env.REACTPRESS_PREVIEW_PORT || '3003';
    try {
      const url = new URL(siteUrl);
      url.port = previewPort;
      return `${url.origin}/`;
    } catch {
      return `http://localhost:${previewPort}/`;
    }
  }

  async activateTheme(id: string): Promise<SiteThemeState & { siteUrl?: string }> {
    if (!this.isValidThemeId(id)) {
      throw new BadRequestException(`Invalid theme id "${id}"`);
    }
    const themeDir = this.resolveThemeDir(id);
    if (!themeDir) throw new NotFoundException(`Theme "${id}" not found`);

    const state = await this.getThemeState();
    const installedThemes = state.installedThemes.includes(id)
      ? state.installedThemes
      : [...state.installedThemes, id];

    const saved = await this.saveThemeState({
      activeTheme: id,
      installedThemes,
      previewThemeId: id,
    });
    this.clearPreviewThemeManifest();
    this.syncActiveThemeManifest(id);
    this.scheduleProductionClientRestart();

    const row = await this.getSettingRow();
    const siteUrl = this.resolveSiteUrlFromRow(row);

    return { ...saved, siteUrl };
  }

  async getActiveThemePublic(): Promise<{
    activeTheme: string;
    themeDir: string | null;
    siteUrl: string;
  }> {
    const state = await this.getThemeState();
    const themeDir = this.resolveThemeDir(state.activeTheme);
    const row = await this.getSettingRow();
    return {
      activeTheme: state.activeTheme,
      themeDir: themeDir ? path.relative(projectRoot(), themeDir) : null,
      siteUrl: this.resolveSiteUrlFromRow(row),
    };
  }

  async updateThemeMods(themeId: string, mods: ThemeMods): Promise<SiteThemeState> {
    const state = await this.getThemeState();
    const themeMods = { ...(state.mods[themeId] ?? {}) };
    for (const [key, value] of Object.entries(mods)) {
      if (value === "") {
        delete themeMods[key];
      } else {
        themeMods[key] = value;
      }
    }
    const nextMods = { ...state.mods, [themeId]: themeMods };
    return this.saveThemeState({ mods: nextMods, previewThemeId: themeId });
  }

  /**
   * Point local theme dev (active-theme.json) at `themeId` without changing DB activeTheme.
   * Ensures admin iframe preview matches the real Next.js theme package.
   */
  async beginPreviewSession(themeId: string): Promise<ThemePreviewSessionResult> {
    if (!this.isValidThemeId(themeId)) {
      throw new BadRequestException(`Invalid theme id "${themeId}"`);
    }
    const themeDir = this.resolveThemeDir(themeId);
    if (!themeDir) throw new NotFoundException(`Theme "${themeId}" not found`);

    const state = await this.getThemeState();
    const saved = await this.saveThemeState({ previewThemeId: themeId });

    if (themeId !== state.activeTheme) {
      this.syncPreviewThemeManifest(themeId);
    } else {
      this.clearPreviewThemeManifest();
    }

    const row = await this.getSettingRow();
    const siteUrl = this.resolveSiteUrlFromRow(row);
    return {
      ...saved,
      activeTheme: state.activeTheme,
      siteUrl,
      previewSiteUrl:
        themeId !== state.activeTheme ? this.resolvePreviewSiteUrl(siteUrl) : undefined,
    };
  }

  /** End admin preview — clear preview dev manifest only (active theme unchanged). */
  async endPreviewSession(): Promise<SiteThemeState & { siteUrl: string }> {
    const state = await this.getThemeState();
    this.clearPreviewThemeManifest();
    const saved = await this.saveThemeState({ previewThemeId: state.activeTheme });
    const row = await this.getSettingRow();
    return { ...saved, siteUrl: this.resolveSiteUrlFromRow(row) };
  }

  getCoverPath(id: string): string | null {
    const dir = this.resolveThemeDir(id);
    if (!dir) return null;
    const candidates = ['cover.png', 'cover.jpg', 'cover.webp', 'cover.jpeg'];
    for (const file of candidates) {
      const full = path.join(dir, file);
      if (fs.existsSync(full)) return full;
    }
    const manifest = this.readManifest(dir);
    if (manifest?.cover) {
      const fromManifest = path.join(dir, manifest.cover);
      if (fs.existsSync(fromManifest)) return fromManifest;
    }
    return null;
  }

  private themeAppearanceDefaults(manifest: ThemeManifest | null): ThemeMods {
    const defaults: ThemeMods = {};
    for (const section of manifest?.appearance?.sections ?? []) {
      for (const setting of section.settings ?? []) {
        if (setting.default) defaults[setting.id] = setting.default;
      }
    }
    return defaults;
  }

  buildPlaceholderCoverSvg(id: string): string {
    const dir = this.resolveThemeDir(id);
    const manifest = dir ? this.readManifest(dir) : null;
    const name = manifest?.name ?? id;
    const defaults = this.themeAppearanceDefaults(manifest);
    const primary = defaults.primaryColor ?? '#2271b1';
    const accent = defaults.accentColor ?? '#72aee6';
    const safeName = name.replace(/[<>&"']/g, (ch) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return map[ch] ?? ch;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="55%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" />
  <rect x="48" y="48" width="704" height="404" rx="12" fill="rgba(255,255,255,0.14)" />
  <text x="400" y="250" text-anchor="middle" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="42" font-weight="700">${safeName}</text>
  <text x="400" y="300" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="18">ReactPress Theme</text>
</svg>`;
  }

  private resolveSiteUrlFromRow(row: Setting): string {
    return (
      process.env.NGINX_ENTRY_URL ||
      process.env.REACTPRESS_NGINX_ENTRY_URL ||
      (process.env.NGINX_PORT ? `http://localhost:${process.env.NGINX_PORT}` : null) ||
      row.systemUrl ||
      process.env.CLIENT_SITE_URL ||
      'http://localhost:3001'
    );
  }

  buildPreviewHtml(themeId: string, mods: ThemeMods = {}): string {
    const dir = this.resolveThemeDir(themeId);
    const manifest = dir ? this.readManifest(dir) : null;
    const name = manifest?.name ?? themeId;
    const primary = mods.primaryColor ?? '#2271b1';
    const accent = mods.accentColor ?? '#d63638';
    const bg = mods.backgroundColor ?? '#f0f0f1';
    const displayTitle = mods.displayTitle ?? name;
    const displayTagline = mods.displayTagline ?? manifest?.description ?? 'Theme preview';
    const dark =
      mods.darkMode === '1' || mods.darkMode === 'true' || mods.darkMode === 'yes';
    const textColor = dark ? '#e8e8e8' : '#1d2327';
    const pageBg = dark ? '#1a1a1a' : bg;
    const bgImage = mods.backgroundImage?.trim();
    const extraCss = mods.additionalCss?.trim() ?? '';

    return `<!DOCTYPE html>
<html lang="zh-CN"${dark ? ' data-rp-dark="true"' : ''}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${displayTitle} — Preview</title>
  <style>
    :root {
      --rp-primary: ${primary};
      --rp-accent: ${accent};
      --rp-bg: ${pageBg};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${bgImage ? `url("${bgImage.replace(/"/g, '\\"')}") center/cover fixed` : 'var(--rp-bg)'};
      color: ${textColor};
      line-height: 1.6;
    }
    ${extraCss}
    .wrap { max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    header { border-bottom: 3px solid var(--rp-primary); padding-bottom: 1rem; margin-bottom: 2rem; }
    h1 { color: var(--rp-primary); font-size: 2rem; margin: 0 0 0.25rem; }
    .tagline { color: #646970; margin: 0; }
    h2 { color: var(--rp-accent); margin-top: 2rem; }
    a { color: var(--rp-primary); }
    .card {
      background: #fff;
      border: 1px solid #c3c4c7;
      border-radius: 4px;
      padding: 1.25rem;
      margin-top: 1rem;
    }
    .meta { font-size: 0.875rem; color: #646970; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>${displayTitle}</h1>
      <p class="tagline">${displayTagline}</p>
    </header>
    <h2>排版示例</h2>
    <p>这是 <strong>${name}</strong> 主题的实时预览。在左侧自定义器中修改颜色与标题后，此页面会即时更新。</p>
    <h3>标题层级</h3>
    <h4>四级标题</h4>
    <h5>五级标题</h5>
    <h6>六级标题</h6>
    <ul>
      <li>无序列表项</li>
      <li><a href="#">示例链接</a></li>
    </ul>
    <article class="card">
      <h2 style="margin-top:0">Hello world!</h2>
      <p class="meta">发布于 ${new Date().toLocaleDateString('zh-CN')}</p>
      <p>欢迎使用 ReactPress 主题系统。激活主题后，访客站点将使用该主题的 Next.js 模板渲染。</p>
    </article>
  </div>
</body>
</html>`;
  }

  async getPreviewMods(themeId: string, overrideMods?: ThemeMods): Promise<ThemeMods> {
    if (overrideMods && Object.keys(overrideMods).length > 0) return overrideMods;
    const state = await this.getThemeState();
    return state.mods[themeId] ?? {};
  }

  createPreviewDraft(payload: {
    themeId?: string;
    mods?: ThemeMods;
    configuration?: Record<string, unknown>;
  }): { token: string } {
    const token = putPreviewDraft(payload);
    return { token };
  }

  resolvePreviewDraft(token: string): {
    themeId?: string;
    mods?: ThemeMods;
    configuration?: Record<string, unknown>;
  } | null {
    const draft = getPreviewDraft(token);
    if (!draft) return null;
    return {
      themeId: draft.themeId,
      mods: draft.mods,
      configuration: draft.configuration,
    };
  }

  async ensureDefaultTheme(): Promise<void> {
    const state = await this.getThemeState();
    if (!state.activeTheme) {
      const saved = await this.saveThemeState(defaultSiteThemeState);
      this.syncActiveThemeManifest(saved.activeTheme);
      return;
    }
    this.syncActiveThemeManifest(state.activeTheme);
  }

  private copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (ThemeService.COPY_SKIP_NAMES.has(entry.name)) continue;
      const from = path.join(src, entry.name);
      const to = path.join(dest, entry.name);
      if (entry.isSymbolicLink()) {
        const link = fs.readlinkSync(from);
        fs.symlinkSync(link, to);
      } else if (entry.isDirectory()) {
        this.copyDir(from, to);
      } else if (entry.isFile()) {
        fs.copyFileSync(from, to);
      }
    }
  }

  /** Reuse template theme node_modules in monorepo dev (pnpm symlinks cannot be copyFileSync'd). */
  private linkTemplateNodeModules(templatePath: string, targetDir: string): void {
    const srcModules = path.join(templatePath, 'node_modules');
    const destModules = path.join(targetDir, 'node_modules');
    if (!fs.existsSync(srcModules) || fs.existsSync(destModules)) return;
    const linkTarget = path.relative(targetDir, srcModules);
    const linkType = fs.lstatSync(srcModules).isDirectory() ? 'dir' : 'file';
    fs.symlinkSync(linkTarget, destModules, linkType);
  }

  private removeDir(dir: string): void {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        fs.unlinkSync(target);
      } else if (entry.isDirectory()) {
        this.removeDir(target);
      } else {
        fs.unlinkSync(target);
      }
    }
    fs.rmdirSync(dir);
  }
}
