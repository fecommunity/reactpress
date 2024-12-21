import { useEffect, useRef, FC, ReactNode } from 'react';
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
    tagInstance.init(ref.current);
  }, []);

  return (
    <div className={styles.tagCloud} ref={ref}>
      {props.children}
    </div>
  );
};

export default TagCloud;
