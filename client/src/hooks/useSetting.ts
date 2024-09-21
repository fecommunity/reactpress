import { useContext } from 'react';

import { GlobalContext } from '@/context/global';

export const useSetting = () => {
  const context = useContext(GlobalContext);
  return context.setting || {};
};
