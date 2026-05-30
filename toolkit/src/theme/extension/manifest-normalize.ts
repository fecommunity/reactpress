import type { ThemeConfigurationSchema } from './configuration/types';
import type {
  ThemeAppearanceGroup,
  ThemeAppearanceManifest,
  ThemeAppearancePanel,
  ThemeAppearanceSection,
  ThemeAppearanceSetting,
  ThemeManifest,
} from './theme';

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : undefined;
}

function normalizeSetting(raw: RawRecord): ThemeAppearanceSetting {
  return {
    id: String(raw.id),
    type: raw.type as ThemeAppearanceSetting['type'],
    label: String(raw.label),
    default: typeof raw.default === 'string' ? raw.default : undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    choices: Array.isArray(raw.choices)
      ? (raw.choices as ThemeAppearanceSetting['choices'])
      : undefined,
    group: typeof raw.group === 'string' ? raw.group : undefined,
  };
}

function normalizeGroup(raw: RawRecord): ThemeAppearanceGroup {
  return {
    id: String(raw.id),
    title: String(raw.title),
    description: typeof raw.description === 'string' ? raw.description : undefined,
  };
}

function normalizePanel(raw: RawRecord): ThemeAppearancePanel {
  return {
    id: String(raw.id),
    title: String(raw.title),
    description: typeof raw.description === 'string' ? raw.description : undefined,
  };
}

function normalizeSection(raw: RawRecord): ThemeAppearanceSection {
  return {
    id: String(raw.id),
    title: String(raw.title),
    panel: typeof raw.panel === 'string' ? raw.panel : undefined,
    embed: raw.embed === 'options' ? 'options' : undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    groups: Array.isArray(raw.groups)
      ? raw.groups.map((item) => normalizeGroup(asRecord(item) ?? {}))
      : undefined,
    settings: Array.isArray(raw.settings)
      ? raw.settings.map((item) => normalizeSetting(asRecord(item) ?? {}))
      : undefined,
  };
}

export function normalizeAppearance(raw: unknown): ThemeAppearanceManifest | undefined {
  const source = asRecord(raw);
  if (!source) return undefined;

  const panels = Array.isArray(source.panels)
    ? source.panels.map((item) => normalizePanel(asRecord(item) ?? {}))
    : undefined;

  const sections = Array.isArray(source.sections)
    ? source.sections.map((item) => normalizeSection(asRecord(item) ?? {}))
    : [];

  if (panels === undefined && sections.length === 0) return undefined;
  return { panels, sections };
}

export function normalizePlatformFields(o: RawRecord): Pick<
  ThemeManifest,
  'requires' | 'supports' | 'templates' | 'options'
> {
  const requires = typeof o.requires === 'string' ? o.requires : undefined;
  const supports = o.supports as ThemeManifest['supports'];
  const templates = o.templates as ThemeManifest['templates'];
  const options = o.options as ThemeConfigurationSchema | undefined;

  return {
    requires,
    supports: supports && typeof supports === 'object' ? supports : undefined,
    templates: templates && typeof templates === 'object' ? templates : undefined,
    options: options?.type === 'object' ? options : undefined,
  };
}
