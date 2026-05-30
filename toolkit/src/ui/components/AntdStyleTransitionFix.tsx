import { useEffect } from 'react';

const STYLE_ELEMENT_ID = 'reactpress-antd-style-transition-fix';

export interface AntdStyleTransitionFixProps {
  id?: string;
}

/** Disable Ant Design CSS transitions during hydration to avoid style flash. */
export function AntdStyleTransitionFix({
  id = STYLE_ELEMENT_ID,
}: AntdStyleTransitionFixProps) {
  useEffect(() => {
    const el = document.querySelector(`#${id}`);
    el?.parentNode?.removeChild(el);
  }, [id]);

  return (
    <style
      id={id}
      dangerouslySetInnerHTML={{
        __html: `[class^="ant-"], [class*=" ant-"] { transition: none !important; }`,
      }}
    />
  );
}
