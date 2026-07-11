/** Filter 回调可通过 `__hookReject` 拒绝继续处理（由核心 Service 识别并抛出 HTTP 错误）。 */

export const HOOK_REJECT_KEY = '__hookReject';

export interface HookRejectMeta {
  message: string;
  statusCode?: number;
}

export function createHookRejectValue<T extends Record<string, unknown>>(
  value: T,
  reject: HookRejectMeta,
): T & { __hookReject: HookRejectMeta } {
  return { ...value, [HOOK_REJECT_KEY]: reject };
}

export function getHookReject(value: unknown): HookRejectMeta | null {
  if (!value || typeof value !== 'object') return null;
  const reject = (value as Record<string, unknown>)[HOOK_REJECT_KEY];
  if (!reject || typeof reject !== 'object') return null;
  const message = (reject as HookRejectMeta).message;
  if (typeof message !== 'string' || !message.trim()) return null;
  return reject as HookRejectMeta;
}

export function sanitizeHookRejectStatusCode(statusCode?: number): number {
  if (typeof statusCode !== 'number' || !Number.isInteger(statusCode)) {
    return 400;
  }
  if (statusCode < 400 || statusCode > 599) {
    return 400;
  }
  return statusCode;
}

export function stripHookMeta<T extends Record<string, unknown>>(value: T): T {
  if (!(HOOK_REJECT_KEY in value)) return value;
  const next = { ...value };
  delete next[HOOK_REJECT_KEY];
  return next;
}
