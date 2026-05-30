import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

function Logo({ className }) {
  const src = useBaseUrl('/img/logo.svg');

  return (
    <img
      src={src}
      width={112}
      height={102}
      alt="ReactPress"
      className={className}
      decoding="async"
    />
  );
}

export default Logo;
