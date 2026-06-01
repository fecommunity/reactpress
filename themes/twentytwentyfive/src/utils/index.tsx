import {
  FolderOutlined,
  HomeOutlined,
  MessageOutlined,
  ProfileOutlined,
  SearchOutlined,
  SettingOutlined,
  TagOutlined,
  UserOutlined,
  iconMap,
} from '@/icons';
import React from 'react';

const iconMapLocal: Record<string, React.ComponentType<{ size?: number }>> = {
  suggestions: MessageOutlined,
  github: ProfileOutlined,
  home: HomeOutlined,
  settings: SettingOutlined,
  user: UserOutlined,
  search: SearchOutlined,
  message: MessageOutlined,
  tag: TagOutlined,
  folder: FolderOutlined,
  profile: ProfileOutlined,
  ...iconMap,
};

const colors = [
  '#52c41a', '#f5222d', '#1890ff', '#faad14', '#ff0064', '#722ed1',
  '#dc3545', '#17a2b8', '#00b74a', '#fc651f', '#6c757d', '#f5c800',
  '#808695', '#2db7f5', '#87d068', '#108ee9',
];

export const getRandomColor = (() => {
  const cache: Record<string, string> = {};
  return (key: string): string => {
    if (!cache[key]) {
      cache[key] = colors[Math.floor(Math.random() * colors.length)];
    }
    return cache[key];
  };
})();

export function elementInViewport(el: HTMLElement) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  let parent: HTMLElement = el;

  while (parent.offsetParent) {
    parent = parent.offsetParent as HTMLElement;
    top += parent.offsetTop;
    left += parent.offsetLeft;
  }

  return (
    top < window.pageYOffset + window.innerHeight &&
    left < window.pageXOffset + window.innerWidth &&
    top + height > window.pageYOffset &&
    left + width > window.pageXOffset
  );
}

export function getDocumentScrollTop() {
  return document.documentElement.scrollTop || window.pageYOffset || window.scrollY || document.body.scrollTop;
}

export const groupBy = function <T>(data: T[], condition: (item: T, i: number, arr: T[]) => string | null | undefined) {
  if (!condition || !Array.isArray(data)) {
    return data;
  }
  const result: Record<string, T[]> = Object.create(null);
  data.forEach((item, i, arr) => {
    const key = condition(item, i, arr);
    if (key == null) return;
    (result[key] ??= []).push(item);
  });
  return result;
};

export const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' Byte';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / 1024 / 1024).toFixed(2) + ' MB';
};

export function resolveUrl(baseURL: string, relativeURL: string) {
  if (!baseURL) baseURL = '/';
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
};

export const isOdd = (v: number) => v % 2 !== 0;

export const scrollToBottom = (el: HTMLElement) => {
  const currentScrollTop = el.scrollTop;
  const clientHeight = el.offsetHeight;
  const scrollHeight = el.scrollHeight;
  el.scrollTo(0, currentScrollTop + (scrollHeight - currentScrollTop - clientHeight));
};

export function getColorFromNumber(num: number) {
  return colors[num % colors.length];
}

export function getIconByName(name: string | React.ReactElement) {
  if (React.isValidElement(name)) {
    return () => name;
  }
  const IconComponent = iconMapLocal[name] ?? null;
  return IconComponent || (() => null);
}

export function getFirstLevelRoute(path: string, locales: string[] = ['zh', 'en']) {
  if (!path.startsWith('/')) path = '/' + path;
  if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    segments.shift();
    path = segments.length ? `/${segments.join('/')}` : '/';
  }
  const secondSlashIndex = path.indexOf('/', 1);
  return secondSlashIndex === -1 ? path : path.slice(0, secondSlashIndex);
}
