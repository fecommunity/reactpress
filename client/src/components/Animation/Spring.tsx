import React, { useCallback, useEffect, useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import VisibilitySensor from 'react-visibility-sensor';

import { elementInViewport } from '@/utils';

export interface SpringProps {
  containerProps?: Record<string, unknown>;
  from?: Record<string, number>;
  to?: Record<string, number>;
}

export const Spring: React.FC<SpringProps> = ({ containerProps = {}, from = {}, to = {}, children }) => {
  const ref = useRef();
  const [styles, animation] = useSpring(() => ({
    ...from,
    config: { mass: 10, tension: 400, friction: 40, precision: 0.00001, clamp: true },
  }));
  const onViewportChange = useCallback(
    (visible) => {
      if (visible) {
        animation.start(to);
      }
    },
    [animation, to]
  );

  useEffect(() => {
    if (elementInViewport(ref.current)) {
      animation.start(to);
    }
  }, [animation, to]);

  return (
    <VisibilitySensor onChange={onViewportChange}>
      <animated.div {...containerProps} ref={ref} style={styles}>
        {children}
      </animated.div>
    </VisibilitySensor>
  );
};
