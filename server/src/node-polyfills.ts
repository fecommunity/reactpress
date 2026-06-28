/**
 * Node.js 22+ removed legacy `util.is*` helpers still referenced by NestJS 6 / TypeORM 0.2.
 * Import this module before any NestJS or TypeORM import.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const util = require('util') as {
  isNullOrUndefined?: (value: unknown) => boolean;
};

if (typeof util.isNullOrUndefined !== 'function') {
  util.isNullOrUndefined = (value: unknown) => value === null || value === undefined;
}
