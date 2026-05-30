import { useEffect } from 'react';

const STYLE_ELEMENT_ID = 'reactpress-antd-style-transition-fix';

/** Disable Ant Design CSS transitions during hydration to avoid style flash. */
export function AntdStyleTransitionFix() {
  useEffect(() => {
    const el = document.querySelector(`#${STYLE_ELEMENT_ID}`);
    el?.parentNode?.removeChild(el);
  }, []);

  return (
    <style
      id={STYLE_ELEMENT_ID}
      dangerouslySetInnerHTML={{
        __html: `[class^="ant-"], [class*=" ant-"] { transition: none !important; }`,
      }}
    />
  );
}
