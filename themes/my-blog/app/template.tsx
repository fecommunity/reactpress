import type { ReactNode } from 'react';

/** Re-mounts on navigation — drives page enter animation. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="rp-page-enter">{children}</div>;
}
