/* eslint-disable jsx-a11y/anchor-has-content */
import NextLink from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

const CustomLink = ({ href, ...rest }: LinkProps) => {
  if (!href) {
    return <a className="break-words" {...rest} />;
  }

  const isInternalLink = href.startsWith('/');
  const isAnchorLink = href.startsWith('#');

  if (isInternalLink) {
    return <NextLink href={href} className="break-words" {...rest} />;
  }

  if (isAnchorLink) {
    return <a className="break-words" href={href} {...rest} />;
  }

  return (
    <a className="break-words" target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  );
};

export default CustomLink;
