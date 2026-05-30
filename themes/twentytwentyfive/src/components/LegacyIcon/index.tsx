import { Icon as AntLegacyIcon } from '@ant-design/compatible';
import React from 'react';

type LegacyIconProps = {
  type?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

/** `@ant-design/compatible` Icon typed for React 18 JSX. */
export const LegacyIcon: React.FC<LegacyIconProps> = (props) => {
  const Component = AntLegacyIcon as unknown as React.ComponentType<LegacyIconProps>;
  return <Component {...props} />;
};
