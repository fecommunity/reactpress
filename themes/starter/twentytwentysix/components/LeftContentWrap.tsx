import type { ReactNode } from 'react';

interface LeftContentWrapProps {
  menu?: ReactNode;
  children: ReactNode;
}

/** Main column block — category tabs + article list, matches client `leftWrap`. */
export default function LeftContentWrap({ menu, children }: LeftContentWrapProps) {
  return (
    <div className="left-wrap">
      {menu ? <header>{menu}</header> : null}
      <main className="left-wrap-main">{children}</main>
    </div>
  );
}
