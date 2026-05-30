import { message } from 'antd';

import {
  clearThemeSession,
  createThemeAxiosClient,
} from '@fecommunity/reactpress-toolkit/theme';

export const httpProvider = createThemeAxiosClient({
  onError: (msg) => message.error(msg),
  onUnauthorized: () => {
    clearThemeSession();
    window.location.reload();
  },
});
