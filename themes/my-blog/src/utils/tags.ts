import type { ITag } from '@fecommunity/reactpress-toolkit/types';

export function tagLabel(tag: string | ITag | { label?: string; value?: string }): string {
  if (typeof tag === 'string') return tag;
  return tag?.label ?? tag?.value ?? '';
}

export function tagValue(tag: string | ITag | { label?: string; value?: string }): string {
  if (typeof tag === 'string') return tag;
  return tag?.value ?? tag?.label ?? '';
}
