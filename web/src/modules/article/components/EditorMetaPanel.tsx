import { ChevronDown, ChevronUp } from "lucide-react";
import { type ReactNode, useState } from "react";

import styles from "./editor-meta-panel.module.css";

type EditorMetaPanelProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function EditorMetaPanel({ title, defaultOpen = true, children }: EditorMetaPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.panel}>
      <header className={styles.header} onClick={() => setOpen((v) => !v)}>
        <span className={styles.title}>{title}</span>
        <span className={styles.toggle} aria-hidden>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </header>
      {open ? <div className={styles.body}>{children}</div> : null}
    </section>
  );
}
