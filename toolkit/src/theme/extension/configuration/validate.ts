import Ajv, { type ErrorObject } from 'ajv';

import type { ThemeConfigurationSchema } from './types';

const ajv = new Ajv({ allErrors: true, strict: false, coerceTypes: false });

export interface ConfigurationValidationResult {
  valid: boolean;
  errors: ErrorObject[] | null;
  message?: string;
}

export function validateThemeConfiguration(
  schema: ThemeConfigurationSchema | null | undefined,
  data: unknown,
): ConfigurationValidationResult {
  if (!schema) {
    return { valid: true, errors: null };
  }
  const validate = ajv.compile(schema);
  const valid = validate(data) === true;
  if (valid) {
    return { valid: true, errors: null };
  }
  const errors = validate.errors ?? [];
  const message = errors.map((e) => `${e.instancePath || '/'} ${e.message ?? ''}`.trim()).join('; ');
  return { valid: false, errors, message: message || 'Invalid configuration' };
}
