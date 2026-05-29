import type { ReactNode } from 'react';

interface DoubleColumnLayoutProps {
  main: ReactNode;
  sidebar?: ReactNode;
  top?: ReactNode;
}

/** Client-style main + sticky sidebar layout. */
export default function DoubleColumnLayout({ main, sidebar, top }: DoubleColumnLayoutProps) {
  return (
    <div className="site-container">
      {top}
      <div className={`double-column${sidebar ? '' : ' double-column--full'}`}>
        <section className="column-main">{main}</section>
        {sidebar ? (
          <aside className="column-side">
            <div className="sticky">{sidebar}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
