/** Admin capability strings — keep in sync with server guards. */
export type Permission =
  | 'article:read'
  | 'article:write'
  | 'article:publish'
  | 'media:manage'
  | 'page:manage'
  | 'user:manage'
  | 'setting:manage'
  | 'extension:manage'
  | 'comment:manage'
  | 'view:read';

export const ADMIN_PERMISSIONS: Permission[] = [
  'article:read',
  'article:write',
  'article:publish',
  'media:manage',
  'page:manage',
  'user:manage',
  'setting:manage',
  'extension:manage',
  'comment:manage',
  'view:read',
];

/** Map legacy server roles to capability strings. */
export function permissionsForRole(role: string | undefined): Permission[] {
  if (role === 'admin') return [...ADMIN_PERMISSIONS];
  if (role === 'editor') {
    return [
      'article:read',
      'article:write',
      'article:publish',
      'media:manage',
      'page:manage',
      'comment:manage',
      'view:read',
    ];
  }
  return ['article:read', 'view:read'];
}
