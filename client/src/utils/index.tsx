import * as AntdIcons from '@ant-design/icons';
import React from 'react';


const colors = ['#52c41a', '#f5222d', '#1890ff', '#faad14', '#ff0064', '#722ed1'];

const tagColors = [
  '#dc3545',
  '#17a2b8',
  '#00b74a',
  '#fc651f',
  '#6c757d',
  '#f5c800',
  '#808695',
  '#2db7f5',
  '#87d068',
  '#108ee9',
  '#52c41a',
  '#f5222d',
  '#1890ff',
  '#faad14',
  '#ff0064',
  '#722ed1',
];

export const getRandomColor = (() => {
  const cache = {};
  return (key): string => {
    if (!cache[key]) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      cache[key] = color;
      return color;
    }
    return cache[key];
  };
})();

export function throttle(fn, threshhold) {
  let last;
  let timer;
  threshhold || (threshhold = 250);

  return function () {
    const context = this; // eslint-disable-line @typescript-eslint/no-this-alias
    const args = arguments; // eslint-disable-line prefer-rest-params
    const now = +new Date();

    if (last && now < last + threshhold) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

export function elementInViewport(el) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  const width = el.offsetWidth;
  const height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
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

export function download({ name, url }) {
  const eleLink = document.createElement('a');
  eleLink.download = name;
  eleLink.style.display = 'none';
  eleLink.href = url;
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

export const groupBy = function (data, condition) {
  if (!condition || !Array.isArray(data)) {
    return data;
  }
  const result = Object.create(null);
  let key = null;

  data.forEach((item, i, arr) => {
    key = condition(item, i, arr);
    if (key === null || key === undefined) {
      return;
    }
    if (result[key]) {
      result[key].push(item);
    } else {
      result[key] = [item];
    }
  });

  return result;
};

export const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' Byte';
  }
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  }
  return (size / 1024 / 1024).toFixed(2) + ' MB';
};

export function debounce(func, wait, immediate = false) {
  let timeout;

  const debounced = function () {
    const context = this; // eslint-disable-line @typescript-eslint/no-this-alias
    const args = arguments; // eslint-disable-line prefer-rest-params
    const later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}

export function resolveUrl(baseURL, relativeURL) {
  if (!baseURL) {
    baseURL = '/';
  }

  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}

export const isOdd = (v) => v % 2 !== 0;

export const scrollToBottom = (el: HTMLElement) => {
  const currentScrollTop = el.scrollTop;
  const clientHeight = el.offsetHeight;
  const scrollHeight = el.scrollHeight;

  el.scrollTo(0, currentScrollTop + (scrollHeight - currentScrollTop - clientHeight));
};

export function getColorFromNumber(num) {
  const index = num % tagColors.length;
  return tagColors[index];
}


export function getIconByName (name) {
  if (React.isValidElement(name)) {
    return name;
  }
  const IconComponent = AntdIcons?.[name] || null;
  return IconComponent;
};


export function getFirstLevelRoute(path) {
  // 确保路径以斜杠开头，如果不是则添加斜杠
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // 去除路径末尾的斜杠（如果有的话）
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 查找第一个斜杠之后和下一个斜杠（如果有）之前的部分
  const firstSlashIndex = path.indexOf('/'); // 实际上这个索引在这里总是0
  const secondSlashIndex = path.indexOf('/', firstSlashIndex + 1);

  // 如果没有找到第二个斜杠，说明路径只有一级
  const finalPath = secondSlashIndex === -1 ? path : path.slice(0, secondSlashIndex);
  return finalPath || '/';
}