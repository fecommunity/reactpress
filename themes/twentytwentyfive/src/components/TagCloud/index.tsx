import { FC, ReactNode,useEffect, useRef } from 'react';

import styles from './index.module.scss';
import Tag from './tag';

interface IProps {
  children: ReactNode;
  className: string;
}

const TagCloud: FC<IProps> = (props) => {
  const ref = useRef<HTMLDivElement>();
  const tagInstance = useRef<Tag>(new Tag()).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    tagInstance.init(el);
    return () => tagInstance.destroy();
  }, [props.children, tagInstance]);

  return (
    <div className={styles.tagCloud} ref={ref}>
      {props.children}
    </div>
  );
};

export default TagCloud;
