import { useEffect } from 'react';

const id = 'fix-antd-stle-transition';

export const FixAntdStyleTransition = () => {
  useEffect(() => {
    const el = document.querySelector(`#${id}`);
    el && el.parentNode.removeChild(el);
  }, []);

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <style
      id={id}
      dangerouslySetInnerHTML={{
        __html: ` * { transition: none !important; }`,
      }}
    ></style>
  );
};
