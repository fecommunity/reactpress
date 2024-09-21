import React from 'react';
import { animated, useTrail } from 'react-spring';

interface ListTrailProps {
  length: number;
  options: Record<string, unknown>;
  element?: string;
  setItemContainerProps?: (index: number) => Record<string, unknown>;
  renderItem: (index: number) => React.ReactNode;
}

export const ListTrail: React.FC<ListTrailProps> = ({
  length,
  options,
  element = 'li',
  setItemContainerProps = () => ({}),
  renderItem,
}) => {
  const C = animated[element];
  const trail = useTrail(length, {
    config: { mass: 2, tension: 280, friction: 24, clamp: true },
    ...options,
  });

  return (
    <>
      {trail.map((style, index) => {
        return (
          <C key={index} style={style} {...setItemContainerProps(index)}>
            {renderItem(index)}
          </C>
        );
      })}
    </>
  );
};
