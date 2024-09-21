import { useContext } from 'react';

import { GlobalContext } from '@/context/global';

export const useUser = () => {
  const context = useContext(GlobalContext);
  return context.user;
};
