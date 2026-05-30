import { default as Router } from 'next/router';

export const toLogin = () => {
  const { pathname, asPath } = Router;

  // 更新URL的路径
  window.location.pathname = `/login?action=login&redirect=${asPath}`;
};
