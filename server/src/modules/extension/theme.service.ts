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

import { resolveProjectRoot, resolveMonorepoRoot } from '../../utils/project-root.util';
import { SettingService } from '../setting/setting.service';
import { Setting } from '../setting/setting.entity';
import { buildThemePlaceholderCoverSvg } from '../../../../cli/out/lib/theme-placeholder-cover.js';
import {
  findThemeCatalogEntry,
  loadThemeRegistry,
  readThemeCatalogEntries,
  readThemesPackageMeta,
  resolveThemeCatalogInstallSpec,
  type ThemeRegistryCatalogEntry,
} from './theme-registry.bridge';
import { getPreviewDraft, putPreviewDraft } from './preview-draft.store';

export interface ThemeNpmLockMeta {
  spec: string;
  resolvedVersion?: string;
  packageName?: string;
  installedAt?: string;
}

export interface ThemeCatalogEntry extends ThemeRegistryCatalogEntry {}

export interface ThemeListItem extends ThemeManifest {
  /** local = registry source in themes/; npm = catalog not yet installed; installed = in runtime */
  source: 'local' | 'npm' | 'installed';
  installed: boolean;
  active: boolean;
  /** Shipped with ReactPress registry or featured npm catalog entry */
  official?: boolean;
  coverUrl?: string;
  npm?: ThemeNpmLockMeta;
  catalog?: Pick<ThemeCatalogEntry, 'dependency' | 'npm' | 'featured' | 'themeUri' | 'previewUrl'>;
}

export type ThemePreviewSessionResult = SiteThemeState & {
  siteUrl: string;
  /** Separate dev URL when preview theme ≠ active (e.g. http://localhost:3003/). */
  previewSiteUrl?: string;
};

function projectRoot(): string {
  return resolveProjectRoot();
}

function monorepoRoot(): string {
  return resolveMonorepoRoot();
}

function resolveThemeInstallScript(): string {
  const candidates = [
    path.join(monorepoRoot(), 'cli', 'lib', 'theme-install.js'),
    path.join(projectRoot(), 'cli', 'lib', 'theme-install.js'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

function isResolvableThemeDirEntry(entry: fs.Dirent, parentDir: string): boolean {
  if (!entry.isDirectory() && !entry.isSymbolicLink()) return false;
  try {
    return fs.statSync(path.join(parentDir, entry.name)).isDirectory();
  } catch {
    return false;
  }
}

const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const PREVIEW_POOL_PORTS = [3003];
const PREVIEW_POOL_MANIFEST = path.join('.reactpress', 'preview-pool.json');
/** Ephemeral installed copies — under .reactpress/ with active-theme.json */
const THEME_RUNTIME_REL = path.join('.reactpress', 'runtime');
const LEGACY_THEMES_RUNTIME_REL = path.join('themes', 'runtime');
const THEMES_RESERVED_SUBDIRS = new Set(['starter', 'bundled', 'core', 'theme-starter']);
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
    private readonly settingService: SettingService,
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

  /** Link monorepo-installed themes into the desktop site runtime for manifest + preview dev. */
  private ensureSiteRuntimeLink(id: string, sourceDir: string): string {
    const targetDir = path.join(this.runtimeDir(), id);
    fs.mkdirSync(this.runtimeDir(), { recursive: true });
    if (fs.existsSync(targetDir)) {
      return targetDir;
    }
    try {
      fs.symlinkSync(sourceDir, targetDir, 'dir');
    } catch {
      return sourceDir;
    }
    this.ensureRuntimeThemeTsconfigBase();
    return targetDir;
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

  private readNpmThemeLock(): Record<string, ThemeNpmLockMeta> {
    const lockPath = path.join(projectRoot(), '.reactpress', 'themes.lock.json');
    if (!fs.existsSync(lockPath)) return {};
    try {
      const raw = JSON.parse(fs.readFileSync(lockPath, 'utf8')) as {
        themes?: Record<string, ThemeNpmLockMeta & { source?: string }>;
      };
      const themes = raw.themes ?? {};
      const npmOnly: Record<string, ThemeNpmLockMeta> = {};
      for (const [id, entry] of Object.entries(themes)) {
        if (entry?.source === 'npm' && entry.spec) {
          npmOnly[id] = {
            spec: entry.spec,
            resolvedVersion: entry.resolvedVersion,
            packageName: entry.packageName,
            installedAt: entry.installedAt,
          };
        }
      }
      return npmOnly;
    } catch {
      return {};
    }
  }

  private readThemeCatalogFile(): ThemeCatalogEntry[] {
    return readThemeCatalogEntries(projectRoot());
  }

  getThemeCatalog(): ThemeCatalogEntry[] {
    return this.readThemeCatalogFile();
  }

  private findCatalogEntry(id: string): ThemeCatalogEntry | null {
    return findThemeCatalogEntry(id, projectRoot());
  }

  private getThemeManifestFromSources(themeId: string): ThemeManifest | null {
    const dir = this.resolveThemeDir(themeId);
    if (dir) {
      return this.readManifest(dir);
    }
    const catalog = this.findCatalogEntry(themeId);
    if (!catalog) return null;
    const manifest = loadThemeRegistry().catalogEntryToManifest(catalog);
    return manifest ? (manifest as unknown as ThemeManifest) : null;
  }

  /** Ensure theme exists on disk — bundled copy or catalog npm install. */
  private async ensureThemeMaterialized(id: string): Promise<string> {
    const existing = this.resolveThemeDir(id);
    if (existing) return existing;

    const templatePath = path.join(this.templatesDir(), id);
    if (fs.existsSync(templatePath) && !THEMES_RESERVED_SUBDIRS.has(id)) {
      await this.installTheme(id);
      const installed = this.resolveThemeDir(id);
      if (installed) return installed;
    }

    const catalog = this.findCatalogEntry(id);
    if (catalog?.npm) {
      await this.installThemeFromNpm(catalog.npm);
      const installed = this.resolveThemeDir(id);
      if (installed) return installed;
    }

    throw new NotFoundException(`Theme "${id}" not found`);
  }

  private listDirThemes(
    dir: string,
    source: 'installed',
    options?: { skipDirNames?: Set<string> },
  ): ThemeManifest[] {
    if (!fs.existsSync(dir)) return [];
    const skip = options?.skipDirNames;
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => isResolvableThemeDirEntry(d, dir) && !(skip && skip.has(d.name)))
      .map((d) => this.readManifest(path.join(dir, d.name)))
      .filter((m): m is ThemeManifest => m !== null);
  }

  private async getSettingRow(): Promise<Setting> {
    return this.settingService.getSettingRow();
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

  private listLocalThemes(): ThemeManifest[] {
    return this.listBundledThemes();
  }

  private listBundledThemes(): ThemeManifest[] {
    const { bundled: local } = readThemesPackageMeta(projectRoot());
    const manifests: ThemeManifest[] = [];
    for (const id of local) {
      const manifest = this.readManifest(path.join(this.templatesDir(), id));
      if (manifest) manifests.push(manifest);
    }
    return manifests;
  }

  private isRegistryLocalTheme(id: string): boolean {
    const { bundled: local } = readThemesPackageMeta(projectRoot());
    return local.includes(id);
  }

  private hasOfficialTag(tags?: string[]): boolean {
    return (tags ?? []).some((tag) => /^(official|官方)$/i.test(String(tag).trim()));
  }

  private resolveThemeOfficial(
    manifest: ThemeManifest,
    catalog?: ThemeListItem['catalog'],
  ): boolean {
    if (this.isRegistryLocalTheme(manifest.id)) return true;
    if (catalog?.featured === true) return true;
    if (this.hasOfficialTag(manifest.tags)) return true;
    const catalogEntry = this.findCatalogEntry(manifest.id);
    if (catalogEntry?.featured === true) return true;
    return this.hasOfficialTag(catalogEntry?.tags);
  }

  private catalogMetaFromEntry(entry: ThemeCatalogEntry): ThemeListItem['catalog'] {
    return {
      dependency: entry.dependency,
      npm: entry.npm,
      featured: entry.featured,
      themeUri: entry.themeUri,
      previewUrl: entry.previewUrl,
    };
  }

  async listThemes(): Promise<ThemeListItem[]> {
    const state = await this.getThemeState();
    const installedSet = new Set(state.installedThemes);
    const npmLock = this.readNpmThemeLock();
    const byId = new Map<string, ThemeListItem>();

    const add = (
      manifest: ThemeManifest,
      source: 'local' | 'npm' | 'installed',
      npm?: ThemeNpmLockMeta,
      catalog?: ThemeListItem['catalog'],
    ) => {
      const installed = installedSet.has(manifest.id) || source === 'installed';
      const merged = this.applyTemplateAppearanceSchema(manifest);
      byId.set(merged.id, {
        ...merged,
        source,
        installed,
        active: state.activeTheme === merged.id,
        official: this.resolveThemeOfficial(merged, catalog),
        coverUrl: `/api/extension/themes/${merged.id}/cover`,
        npm,
        catalog,
      });
    };

    for (const m of this.listLocalThemes()) {
      add(m, 'local');
    }
    for (const m of this.listDirThemes(this.runtimeDir(), 'installed')) {
      const npm = npmLock[m.id];
      const catalogEntry = this.findCatalogEntry(m.id);
      add(
        m,
        'installed',
        npm,
        catalogEntry
          ? this.catalogMetaFromEntry(catalogEntry)
          : npm
            ? { npm: npm.spec }
            : undefined,
      );
    }

    for (const entry of this.readThemeCatalogFile()) {
      if (byId.has(entry.id)) continue;
      add(
        {
          id: entry.id,
          name: entry.name,
          version: entry.version,
          description: entry.description,
          author: entry.author,
          themeUri: entry.themeUri,
          tags: entry.tags,
          requires: entry.requires,
        },
        'npm',
        undefined,
        { dependency: entry.dependency, npm: entry.npm, featured: entry.featured, themeUri: entry.themeUri, previewUrl: entry.previewUrl },
      );
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

    const site = projectRoot();
    const mono = monorepoRoot();
    if (mono !== site) {
      const monoRuntime = path.join(mono, THEME_RUNTIME_REL, id);
      if (fs.existsSync(monoRuntime) && fs.statSync(monoRuntime).isDirectory()) {
        return this.ensureSiteRuntimeLink(id, monoRuntime);
      }
      const monoTheme = path.join(mono, 'themes', id);
      if (
        fs.existsSync(monoTheme) &&
        fs.statSync(monoTheme).isDirectory() &&
        !THEMES_RESERVED_SUBDIRS.has(id)
      ) {
        return monoTheme;
      }
    }

    return null;
  }

  async installTheme(id: string): Promise<SiteThemeState> {
    if (!this.isValidThemeId(id)) {
      throw new BadRequestException(`Invalid theme id "${id}"`);
    }
    const templatePath = path.join(this.templatesDir(), id);
    if (!fs.existsSync(templatePath) || THEMES_RESERVED_SUBDIRS.has(id)) {
      const catalog = this.findCatalogEntry(id);
      if (catalog?.npm) {
        return this.installThemeFromNpm(catalog.npm);
      }
      throw new NotFoundException(`Theme template "${id}" not found`);
    }
    const targetDir = path.join(this.runtimeDir(), id);
    fs.mkdirSync(this.runtimeDir(), { recursive: true });
    if (fs.existsSync(targetDir)) {
      this.removeDir(targetDir);
    }
    this.materializeRuntimeTheme(templatePath, targetDir);
    this.ensureRuntimeThemeTsconfigBase();

    const state = await this.getThemeState();
    const installedThemes = state.installedThemes.includes(id)
      ? state.installedThemes
      : [...state.installedThemes, id];
    return this.saveThemeState({ installedThemes });
  }

  async installThemeFromNpm(
    spec: string,
    options?: { skipDependencies?: boolean },
  ): Promise<SiteThemeState & { themeId: string; npmSpec: string }> {
    const trimmed = typeof spec === 'string' ? spec.trim() : '';
    if (!trimmed) {
      throw new BadRequestException('npm spec is required');
    }

    const resolvedSpec = resolveThemeCatalogInstallSpec(trimmed, projectRoot()) ?? trimmed;

    const installScript = resolveThemeInstallScript();
    if (!fs.existsSync(installScript)) {
      throw new BadRequestException('Theme npm installer is not available in this deployment');
    }

    let result: {
      themeId: string;
      npmSpec: string;
    };
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { installThemeFromNpm } = require(installScript) as {
        installThemeFromNpm: (
          root: string,
          npmSpec: string,
          opts?: { skipDependencies?: boolean },
        ) => Promise<{ themeId: string; npmSpec: string }>;
      };
      result = await installThemeFromNpm(projectRoot(), resolvedSpec, {
        skipDependencies: options?.skipDependencies === true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(message || 'Failed to install theme from npm');
    }

    const state = await this.getThemeState();
    const installedThemes = state.installedThemes.includes(result.themeId)
      ? state.installedThemes
      : [...state.installedThemes, result.themeId];
    const saved = await this.saveThemeState({ installedThemes });
    return { ...saved, themeId: result.themeId, npmSpec: result.npmSpec };
  }

  private writeThemeDevManifest(
    fileName: 'active-theme.json' | 'preview-theme.json',
    themeId: string,
  ): void {
    if (!this.isValidThemeId(themeId)) return;
    const themeDir = this.resolveThemeDir(themeId);
    if (!themeDir) return;
    const manifestDir = path.join(projectRoot(), '.reactpress');
    const manifestPath = path.join(manifestDir, fileName);
    const themeDirRel = path.relative(projectRoot(), themeDir);

    if (!this.isSafeThemeDirRel(themeDirRel)) return;

    if (fileName === 'active-theme.json' && fs.existsSync(manifestPath)) {
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

  /** Local dev manifest written by CLI — may differ from DB activeTheme during theme switching. */
  private readLocalDevActiveThemeId(): string | null {
    const manifestPath = path.join(projectRoot(), '.reactpress', 'active-theme.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { activeTheme?: string };
      const id = typeof raw.activeTheme === 'string' ? raw.activeTheme.trim() : '';
      return this.isValidThemeId(id) ? id : null;
    } catch {
      return null;
    }
  }

  private readPreviewPoolManifest(): Record<
    string,
    { port?: string; url?: string; updatedAt?: string }
  > {
    const poolPath = path.join(projectRoot(), PREVIEW_POOL_MANIFEST);
    if (!fs.existsSync(poolPath)) return {};
    try {
      const raw = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  }

  private writePreviewPoolEntry(themeId: string, port: string, siteUrl: string): void {
    const poolPath = path.join(projectRoot(), PREVIEW_POOL_MANIFEST);
    const pool = this.readPreviewPoolManifest();
    let previewUrl: string;
    try {
      const url = new URL(siteUrl);
      url.port = port;
      previewUrl = `${url.origin}/`;
    } catch {
      previewUrl = `http://127.0.0.1:${port}/`;
    }
    pool[themeId] = { port, url: previewUrl, updatedAt: new Date().toISOString() };
    fs.mkdirSync(path.dirname(poolPath), { recursive: true });
    fs.writeFileSync(poolPath, `${JSON.stringify(pool, null, 2)}\n`, 'utf8');
  }

  /** Reserve a stable preview port per theme so admin iframe polls the correct URL immediately. */
  private reservePreviewPortForTheme(themeId: string, siteUrl: string): string {
    const pool = this.readPreviewPoolManifest();
    const existing = pool[themeId]?.port;
    if (existing && PREVIEW_POOL_PORTS.includes(parseInt(existing, 10))) {
      return existing;
    }
    const used = new Set(
      Object.values(pool)
        .map((entry) => parseInt(String(entry?.port ?? ''), 10))
        .filter((n) => Number.isInteger(n)),
    );
    let port = PREVIEW_POOL_PORTS.find((p) => !used.has(p)) ?? PREVIEW_POOL_PORTS[0];
    if (used.size >= PREVIEW_POOL_PORTS.length) {
      let oldestId: string | null = null;
      let oldestAt = Infinity;
      for (const [id, entry] of Object.entries(pool)) {
        const ts = Date.parse(String(entry?.updatedAt ?? ''));
        if (Number.isFinite(ts) && ts < oldestAt) {
          oldestAt = ts;
          oldestId = id;
        }
      }
      if (oldestId && pool[oldestId]?.port) {
        port = parseInt(String(pool[oldestId].port), 10);
        delete pool[oldestId];
      }
    }
    const portStr = String(port);
    this.writePreviewPoolEntry(themeId, portStr, siteUrl);
    return portStr;
  }

  private resolvePreviewSiteUrl(siteUrl: string, themeId?: string): string {
    if (themeId) {
      const entry = this.readPreviewPoolManifest()[themeId];
      if (typeof entry?.url === 'string' && entry.url.startsWith('http')) {
        return entry.url.endsWith('/') ? entry.url : `${entry.url}/`;
      }
      if (entry?.port) {
        try {
          const url = new URL(siteUrl);
          url.port = String(entry.port);
          return `${url.origin}/`;
        } catch {
          return `http://127.0.0.1:${entry.port}/`;
        }
      }
    }
    const previewPort = process.env.REACTPRESS_PREVIEW_PORT || '3003';
    try {
      const url = new URL(siteUrl);
      url.port = previewPort;
      return `${url.origin}/`;
    } catch {
      return `http://127.0.0.1:${previewPort}/`;
    }
  }

  async activateTheme(id: string): Promise<SiteThemeState & { siteUrl?: string }> {
    if (!this.isValidThemeId(id)) {
      throw new BadRequestException(`Invalid theme id "${id}"`);
    }
    await this.ensureThemeMaterialized(id);
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
    await this.ensureThemeMaterialized(themeId);
    const themeDir = this.resolveThemeDir(themeId);
    if (!themeDir) throw new NotFoundException(`Theme "${themeId}" not found`);

    const state = await this.getThemeState();
    const saved = await this.saveThemeState({ previewThemeId: themeId });

    const row = await this.getSettingRow();
    const siteUrl = this.resolveSiteUrlFromRow(row);
    const runtimeActiveTheme = this.readLocalDevActiveThemeId() ?? state.activeTheme;

    if (themeId !== runtimeActiveTheme) {
      this.reservePreviewPortForTheme(themeId, siteUrl);
      this.syncPreviewThemeManifest(themeId);
    } else {
      this.clearPreviewThemeManifest();
    }

    return {
      ...saved,
      activeTheme: runtimeActiveTheme,
      siteUrl,
      previewSiteUrl:
        themeId !== runtimeActiveTheme ? this.resolvePreviewSiteUrl(siteUrl, themeId) : undefined,
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
    const manifest = this.getThemeManifestFromSources(id);
    const defaults = this.themeAppearanceDefaults(manifest);
    return buildThemePlaceholderCoverSvg({
      id,
      name: manifest?.name ?? id,
      primary: defaults.primaryColor,
      accent: defaults.accentColor,
      version: manifest?.version,
    });
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
    const manifest = this.getThemeManifestFromSources(themeId);
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

  private resolveFallbackActiveTheme(state: SiteThemeState): string | null {
    const candidates = [
      state.activeTheme,
      'hello-world',
      ...state.installedThemes,
      defaultSiteThemeState.activeTheme,
    ];
    const seen = new Set<string>();
    for (const id of candidates) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (this.resolveThemeDir(id)) return id;
    }
    for (const manifest of this.listBundledThemes()) {
      if (this.resolveThemeDir(manifest.id)) return manifest.id;
    }
    return null;
  }

  async ensureDefaultTheme(): Promise<void> {
    const state = await this.getThemeState();
    let activeTheme = state.activeTheme;
    if (!activeTheme || !this.resolveThemeDir(activeTheme)) {
      const fallback = this.resolveFallbackActiveTheme(state);
      if (fallback) {
        const saved = await this.saveThemeState({
          activeTheme: fallback,
          previewThemeId: fallback,
          installedThemes: state.installedThemes.includes(fallback)
            ? state.installedThemes
            : [...state.installedThemes, fallback],
        });
        activeTheme = saved.activeTheme;
      } else if (!activeTheme) {
        const saved = await this.saveThemeState(defaultSiteThemeState);
        activeTheme = saved.activeTheme;
      }
    }
    if (this.resolveThemeDir(activeTheme)) {
      this.syncActiveThemeManifest(activeTheme);
    }
  }

  /** Dev: symlink template for instant install; prod: full copy. Set REACTPRESS_THEME_RUNTIME_COPY=1 to force copy. */
  private materializeRuntimeTheme(templatePath: string, targetDir: string): void {
    const forceCopy =
      process.env.REACTPRESS_THEME_RUNTIME_SYMLINK !== '1' &&
      (process.env.REACTPRESS_THEME_RUNTIME_COPY === '1' || process.env.NODE_ENV === 'production');
    if (!forceCopy) {
      const linkTarget = path.relative(path.dirname(targetDir), templatePath);
      fs.symlinkSync(linkTarget, targetDir, 'dir');
      return;
    }
    this.copyDir(templatePath, targetDir);
    this.linkTemplateNodeModules(templatePath, targetDir);
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
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      fs.unlinkSync(dir);
      return;
    }
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
