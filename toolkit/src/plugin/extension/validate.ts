import Ajv, { type ErrorObject } from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false, coerceTypes: false });

export interface PluginSettingsValidationResult {
  valid: boolean;
  errors: ErrorObject[] | null;
  message?: string;
}

const FORBIDDEN_CONFIG_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function assertPlainPluginConfig(config: unknown): Record<string, unknown> {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Plugin config must be a JSON object');
  }
  for (const key of Object.keys(config)) {
    if (FORBIDDEN_CONFIG_KEYS.has(key)) {
      throw new Error(`Invalid config key "${key}"`);
    }
  }
  return config as Record<string, unknown>;
}

export function validatePluginSettings(
  schema: Record<string, unknown> | null | undefined,
  data: unknown,
): PluginSettingsValidationResult {
  if (!schema) {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.keys(data as object).length > 0
    ) {
      return {
        valid: false,
        errors: null,
        message: 'Plugin has no configurable settings',
      };
    }
    return { valid: true, errors: null };
  }

  let config: Record<string, unknown>;
  try {
    config = assertPlainPluginConfig(data);
  } catch (err) {
    return {
      valid: false,
      errors: null,
      message: err instanceof Error ? err.message : 'Invalid plugin config',
    };
  }

  const validate = ajv.compile(schema);
  const valid = validate(config) === true;
  if (valid) {
    return { valid: true, errors: null };
  }

  const errors = validate.errors ?? [];
  const message = errors.map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`.trim()).join('; ');
  return { valid: false, errors, message: message || 'Invalid plugin configuration' };
}
