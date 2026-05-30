import { useEffect, useRef } from "react";

import { MarkdownReader } from "@/shared/components/MarkdownReader";

import { makeHtml } from "./utils/markdown";
import {
  registerScollListener,
  removeScrollListener,
  subjectScrollListener,
} from "./utils/syncScroll";

type PreviewProps = {
  value: string;
};

export function Preview({ value }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = makeHtml(value);

  useEffect(() => {
    const listener = ({ top, left }: { top: number; left: number }) => {
      if (!ref.current) return;
      ref.current.scrollTop = top * ref.current.scrollHeight;
      ref.current.scrollLeft = left;
    };
    subjectScrollListener("preview", "editor", listener);
    return () => removeScrollListener("editor", listener);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listener = registerScollListener("preview", () => ({
      top: el.scrollTop / Math.max(1, el.scrollHeight - el.offsetHeight),
      left: el.scrollLeft,
    }));
    el.addEventListener("scroll", listener, true);
    return () => el.removeEventListener("scroll", listener, true);
  }, []);

  return (
    <div ref={ref} className="editor-preview-pane">
      <MarkdownReader content={html} />
    </div>
  );
}
