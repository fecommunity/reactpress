/* eslint-disable jsx-a11y/anchor-has-content */
import type { AnchorHTMLAttributes } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

const CustomLink = ({ href, ...rest }: LinkProps) => {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');

  if (isInternalLink || isAnchorLink) {
    return <a className="break-words" href={href} {...rest} />;
  }

  return (
    <a className="break-words" target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  );
};

export default CustomLink;
