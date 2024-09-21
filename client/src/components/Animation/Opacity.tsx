import React from 'react';

import { Spring, SpringProps } from './Spring';

export const Opacity: React.FC<SpringProps> = (props) => {
  const { from = {}, to = {}, ...rest } = props;
  from.opacity = 0;
  to.opacity = 1;

  return <Spring from={from} to={to} {...rest} />;
};
