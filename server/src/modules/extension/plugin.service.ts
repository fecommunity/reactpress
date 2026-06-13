import type {
  PluginAdminLocaleMessages,
  PluginManifest,
  SitePluginState,
} from '@fecommunity/reactpress-toolkit/plugin/extension';
import { readPluginAdminLocaleFile } from '@fecommunity/reactpress-toolkit/plugin/node';
import {
  getPluginStateFromGlobalSetting,
  isValidPluginId,
  mergePluginStateIntoGlobalSetting,
  parsePluginManifest,
} from '@fecommunity/reactpress-toolkit/plugin/extension';
import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { resolveProjectRoot } from '../../utils/project-root.util';
import { SettingService } from '../setting/setting.service';
import { Setting } from '../setting/setting.entity';
import { readPluginsPackageMeta } from './plugin-registry.bridge';

export interface PluginListItem extends PluginManifest {
  source: 'local' | 'installed';
  installed: boolean;
  active: boolean;
  loadError?: string;
  config?: Record<string, unknown>;
}

const PLUGIN_RUNTIME_REL = path.join('.reactpress', 'plugins');

function projectRoot(): string {
  return resolveProjectRoot();
}

@Injectable()
export class PluginService {
  private readonly logger = new Logger(PluginService.name);

  private static readonly COPY_SKIP_NAMES = new Set([
    'node_modules',
    '.git',
    'src',
    '.turbo',
    'coverage',
    '.reactpress',
    '.cache',
    'package-lock.json',
    'tsconfig.json',
  ]);

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly settingService: SettingService,
  ) {}

  private pluginsRoot(): string {
    return path.join(projectRoot(), 'plugins');
  }

  private templatesDir(): string {
    return this.pluginsRoot();
  }

  runtimeDir(): string {
    return path.join(projectRoot(), PLUGIN_RUNTIME_REL);
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

  async getPluginState(): Promise<SitePluginState> {
    const row = await this.getSettingRow();
    return getPluginStateFromGlobalSetting(this.parseGlobalSetting(row));
  }

  private async savePluginState(patch: Partial<SitePluginState>): Promise<SitePluginState> {
    const row = await this.getSettingRow();
    const merged = mergePluginStateIntoGlobalSetting(this.parseGlobalSetting(row), patch);
    row.globalSetting = JSON.stringify(merged);
    await this.settingRepository.save(row);
    return merged.plugins as SitePluginState;
  }

  readManifest(pluginDir: string): PluginManifest | null {
    const manifestPath = path.join(pluginDir, 'plugin.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const parsed = parsePluginManifest(raw);
      if (parsed) return parsed;
      const id = path.basename(pluginDir);
      return parsePluginManifest({ id, name: id, version: '1.0.0', ...raw });
    } catch {
      return null;
    }
  }

  readRuntimeManifest(pluginId: string): PluginManifest | null {
    const dir = path.join(this.runtimeDir(), pluginId);
    return this.readManifest(dir);
  }

  resolveServerModulePath(pluginId: string, moduleRel: string): string | null {
    const rel = moduleRel.replace(/^\.\//, '');
    const abs = path.join(this.runtimeDir(), pluginId, rel);
    return abs;
  }

  private listLocalPlugins(): PluginManifest[] {
    const { local } = readPluginsPackageMeta(projectRoot());
    const manifests: PluginManifest[] = [];
    for (const id of local) {
      const manifest = this.readManifest(path.join(this.templatesDir(), id));
      if (manifest) manifests.push(manifest);
    }
    return manifests;
  }

  private listInstalledPlugins(): PluginManifest[] {
    const dir = this.runtimeDir();
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => this.readManifest(path.join(dir, d.name)))
      .filter((m): m is PluginManifest => m !== null);
  }

  async listPlugins(): Promise<PluginListItem[]> {
    const state = await this.getPluginState();
    const installedSet = new Set(state.installedPlugins);
    const activeSet = new Set(state.activePlugins);
    const byId = new Map<string, PluginListItem>();

    const add = (manifest: PluginManifest, source: 'local' | 'installed') => {
      const installed = installedSet.has(manifest.id) || source === 'installed';
      const entry = state.entries[manifest.id];
      byId.set(manifest.id, {
        ...manifest,
        source: installed ? 'installed' : source,
        installed,
        active: activeSet.has(manifest.id),
        loadError: entry?.loadError,
        config: entry?.config,
      });
    };

    for (const m of this.listLocalPlugins()) {
      add(m, 'local');
    }
    for (const m of this.listInstalledPlugins()) {
      add(m, 'installed');
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPlugin(id: string): Promise<PluginListItem> {
    const items = await this.listPlugins();
    const found = items.find((p) => p.id === id);
    if (!found) throw new NotFoundException(`Plugin "${id}" not found`);
    return found;
  }

  /** Admin copy from `plugins/{id}/locales/{locale}.json` (same layout as themes). */
  async getPluginAdminLocale(
    pluginId: string,
    locale: string,
  ): Promise<{ pluginId: string; locale: string; messages: PluginAdminLocaleMessages }> {
    if (!isValidPluginId(pluginId)) {
      throw new BadRequestException(`Invalid plugin id "${pluginId}"`);
    }
    const dirs = this.pluginLocaleSearchDirs(pluginId);
    if (dirs.length === 0) {
      throw new NotFoundException(`Plugin "${pluginId}" not found`);
    }

    const safeLocale = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale) ? locale : 'en';
    for (const dir of dirs) {
      const messages = readPluginAdminLocaleFile(dir, safeLocale);
      if (messages) {
        return { pluginId, locale: safeLocale, messages };
      }
    }

    return { pluginId, locale: safeLocale, messages: {} };
  }

  /** Prefer bundled template copy over ephemeral runtime install. */
  private pluginLocaleSearchDirs(pluginId: string): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];
    const push = (dir: string | null) => {
      if (!dir || seen.has(dir)) return;
      seen.add(dir);
      ordered.push(dir);
    };

    const template = path.join(this.templatesDir(), pluginId);
    if (fs.existsSync(template)) {
      push(template);
    }
    const runtime = path.join(this.runtimeDir(), pluginId);
    if (fs.existsSync(runtime)) {
      push(runtime);
    }
    return ordered;
  }

  async installPlugin(id: string): Promise<SitePluginState> {
    if (!isValidPluginId(id)) {
      throw new BadRequestException(`Invalid plugin id "${id}"`);
    }
    const templatePath = path.join(this.templatesDir(), id);
    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(`Plugin template "${id}" not found`);
    }
    const manifest = this.readManifest(templatePath);
    if (!manifest) {
      throw new BadRequestException(`Plugin "${id}" has invalid plugin.json`);
    }

    const targetDir = path.join(this.runtimeDir(), id);
    fs.mkdirSync(this.runtimeDir(), { recursive: true });
    if (fs.existsSync(targetDir)) {
      this.removeDir(targetDir);
    }
    this.materializeRuntimePlugin(templatePath, targetDir);

    const state = await this.getPluginState();
    const installedPlugins = state.installedPlugins.includes(id)
      ? state.installedPlugins
      : [...state.installedPlugins, id];
    const entries = { ...state.entries };
    entries[id] = {
      version: manifest.version,
      source: 'local',
      ...(entries[id] ?? {}),
    };
    return this.savePluginState({ installedPlugins, entries });
  }

  async activatePlugin(id: string): Promise<SitePluginState> {
    if (!isValidPluginId(id)) {
      throw new BadRequestException(`Invalid plugin id "${id}"`);
    }
    await this.ensurePluginMaterialized(id);
    const manifest = this.readRuntimeManifest(id);
    if (!manifest) {
      throw new NotFoundException(`Plugin "${id}" not found in runtime`);
    }

    const state = await this.getPluginState();
    if (!state.installedPlugins.includes(id)) {
      throw new BadRequestException(`Plugin "${id}" is not installed`);
    }

    this.validatePluginDependencies(id, manifest, state);

    const activePlugins = state.activePlugins.includes(id)
      ? state.activePlugins
      : [...state.activePlugins, id];
    const entries = { ...state.entries };
    entries[id] = {
      ...(entries[id] ?? { version: manifest.version, source: 'local' }),
      version: manifest.version,
      activatedAt: new Date().toISOString(),
      loadError: undefined,
    };

    return this.savePluginState({ activePlugins, entries });
  }

  async deactivatePlugin(id: string): Promise<SitePluginState> {
    if (!isValidPluginId(id)) {
      throw new BadRequestException(`Invalid plugin id "${id}"`);
    }
    const state = await this.getPluginState();
    const activePlugins = state.activePlugins.filter((pid) => pid !== id);
    return this.savePluginState({ activePlugins });
  }

  async uninstallPlugin(id: string): Promise<SitePluginState> {
    if (!isValidPluginId(id)) {
      throw new BadRequestException(`Invalid plugin id "${id}"`);
    }
    const state = await this.getPluginState();
    if (state.activePlugins.includes(id)) {
      throw new BadRequestException(`Deactivate plugin "${id}" before uninstalling`);
    }
    const targetDir = path.join(this.runtimeDir(), id);
    if (fs.existsSync(targetDir)) {
      this.removeDir(targetDir);
    }
    const installedPlugins = state.installedPlugins.filter((pid) => pid !== id);
    const entries = { ...state.entries };
    delete entries[id];
    return this.savePluginState({ installedPlugins, entries });
  }

  async updatePluginConfig(
    id: string,
    config: Record<string, unknown>,
  ): Promise<SitePluginState> {
    if (!isValidPluginId(id)) {
      throw new BadRequestException(`Invalid plugin id "${id}"`);
    }
    const state = await this.getPluginState();
    if (!state.installedPlugins.includes(id)) {
      throw new NotFoundException(`Plugin "${id}" is not installed`);
    }
    const entries = { ...state.entries };
    const current = entries[id] ?? { version: '0.0.0', source: 'local' as const };
    entries[id] = { ...current, config };
    return this.savePluginState({ entries });
  }

  async createPluginContext(pluginId: string, manifest: PluginManifest): Promise<PluginContext> {
    const state = await this.getPluginState();
    const entry = state.entries[pluginId];
    return {
      id: pluginId,
      version: manifest.version,
      config: entry?.config ?? {},
      logger: {
        log: (message: string) => this.logger.log(`[${pluginId}] ${message}`),
        warn: (message: string) => this.logger.warn(`[${pluginId}] ${message}`),
        error: (message: string) => this.logger.error(`[${pluginId}] ${message}`),
      },
    };
  }

  async recordLoadError(pluginId: string, message: string): Promise<void> {
    const state = await this.getPluginState();
    const entries = { ...state.entries };
    const current = entries[pluginId] ?? { version: '0.0.0', source: 'local' as const };
    entries[pluginId] = { ...current, loadError: message };
    await this.savePluginState({ entries });
  }

  async clearLoadError(pluginId: string): Promise<void> {
    const state = await this.getPluginState();
    const entry = state.entries[pluginId];
    if (!entry?.loadError) return;
    const entries = { ...state.entries };
    entries[pluginId] = { ...entry, loadError: undefined };
    await this.savePluginState({ entries });
  }

  private validatePluginDependencies(
    id: string,
    manifest: PluginManifest,
    state: SitePluginState,
  ): void {
    const required = manifest.requiresPlugins ?? [];
    for (const dep of required) {
      if (!state.activePlugins.includes(dep) && dep !== id) {
        throw new BadRequestException(`Plugin "${id}" requires active plugin "${dep}"`);
      }
    }
  }

  private async ensurePluginMaterialized(id: string): Promise<void> {
    const runtimePath = path.join(this.runtimeDir(), id);
    if (fs.existsSync(runtimePath)) return;
    await this.installPlugin(id);
  }

  private materializeRuntimePlugin(templatePath: string, targetDir: string): void {
    const forceCopy =
      process.env.REACTPRESS_PLUGIN_RUNTIME_COPY === '1' || process.env.NODE_ENV === 'production';
    if (!forceCopy) {
      const linkTarget = path.relative(path.dirname(targetDir), templatePath);
      fs.symlinkSync(linkTarget, targetDir, 'dir');
      return;
    }
    this.copyDir(templatePath, targetDir);
  }

  private copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (PluginService.COPY_SKIP_NAMES.has(entry.name)) continue;
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

  private removeDir(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      fs.unlinkSync(dir);
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        fs.unlinkSync(full);
      } else if (entry.isDirectory()) {
        this.removeDir(full);
      } else {
        fs.unlinkSync(full);
      }
    }
    fs.rmdirSync(dir);
  }
}
