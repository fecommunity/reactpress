/**
 * Node.js 22+ removed legacy `util.is*` helpers still referenced by NestJS 6 / TypeORM 0.2.
 * Import this module before any NestJS or TypeORM import.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const util = require('util') as Record<string, unknown> & {
  isArray?: (value: unknown) => boolean;
  isBoolean?: (value: unknown) => boolean;
  isBuffer?: (value: unknown) => boolean;
  isDate?: (value: unknown) => boolean;
  isError?: (value: unknown) => boolean;
  isFunction?: (value: unknown) => boolean;
  isNull?: (value: unknown) => boolean;
  isNullOrUndefined?: (value: unknown) => boolean;
  isNumber?: (value: unknown) => boolean;
  isObject?: (value: unknown) => boolean;
  isPrimitive?: (value: unknown) => boolean;
  isRegExp?: (value: unknown) => boolean;
  isString?: (value: unknown) => boolean;
  isSymbol?: (value: unknown) => boolean;
  isUndefined?: (value: unknown) => boolean;
};

const polyfills: Record<string, (value: unknown) => boolean> = {
  isArray: (value) => Array.isArray(value),
  isBoolean: (value) => typeof value === 'boolean',
  isBuffer: (value) => Buffer.isBuffer(value),
  isDate: (value) => value instanceof Date,
  isError: (value) => value instanceof Error,
  isFunction: (value) => typeof value === 'function',
  isNull: (value) => value === null,
  isNullOrUndefined: (value) => value === null || value === undefined,
  isNumber: (value) => typeof value === 'number',
  isObject: (value) => value !== null && typeof value === 'object',
  isPrimitive: (value) => value === null || (typeof value !== 'object' && typeof value !== 'function'),
  isRegExp: (value) => value instanceof RegExp,
  isString: (value) => typeof value === 'string',
  isSymbol: (value) => typeof value === 'symbol',
  isUndefined: (value) => typeof value === 'undefined',
};

for (const [name, fn] of Object.entries(polyfills)) {
  if (typeof util[name] !== 'function') {
    util[name] = fn;
  }
}
