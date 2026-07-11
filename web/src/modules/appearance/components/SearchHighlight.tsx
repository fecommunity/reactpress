import { Fragment, type ReactNode } from "react";

import styles from "@/modules/appearance/components/search-highlight.module.css";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split text and wrap case-insensitive query matches with yellow highlight marks. */
export function highlightSearchText(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q || !text) return text;

  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  const parts = text.split(re);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className={styles.mark}>
        {part}
      </mark>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    ),
  );
}

type Props = {
  text: string;
  query?: string;
  as?: "span" | "div";
  className?: string;
};

export function SearchHighlight({ text, query = "", as: Tag = "span", className }: Props) {
  return <Tag className={className}>{highlightSearchText(text, query)}</Tag>;
}
