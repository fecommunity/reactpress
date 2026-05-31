import { App } from "antd";
import hljs from "highlight.js";
import githubLightCss from "highlight.js/styles/github.min.css?url";
import githubDarkCss from "highlight.js/styles/github-dark.min.css?url";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/stores/settings";

import styles from "./markdown-reader.module.css";

const HLJS_THEME_ID = "hljs-theme-stylesheet";

function useHighlightTheme() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    let link = document.getElementById(HLJS_THEME_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = HLJS_THEME_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = darkMode ? githubDarkCss : githubLightCss;
  }, [darkMode]);
}

type MarkdownReaderProps = {
  content: string;
};

function addLineNumbersForCode(html: string) {
  const text = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n$/, "");
  let num = 1;
  let result = `<span class="ln-num" data-num="${num}"></span>${text}`;
  result = result.replace(/\n/g, () => {
    num += 1;
    return `\n<span class="ln-num" data-num="${num}"></span>`;
  });
  return `<span class="ln-bg"></span>${result}`;
}

export function MarkdownReader({ content }: MarkdownReaderProps) {
  useHighlightTheme();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const ref = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();
  const { t } = useTranslation();

  useEffect(() => {
    if (!content || !ref.current) return;
    const range = document.createRange();
    const slot = range.createContextualFragment(content);
    ref.current.innerHTML = "";
    ref.current.appendChild(slot);
  }, [content, darkMode]);

  useEffect(() => {
    if (!ref.current || !content) return;

    const cleanups: Array<() => void> = [];
    const timer = window.setTimeout(() => {
      const blocks = ref.current?.querySelectorAll("pre code");
      blocks?.forEach((block) => {
        const el = block as HTMLElement;
        if (!el.className.includes("hljsln")) {
          hljs.highlightElement(el);
          el.innerHTML = addLineNumbersForCode(el.innerHTML);
          el.className += " hljsln";
        }

        const span = document.createElement("span");
        span.className = styles.copyCodeBtn;
        span.innerText = t("editor.copyCode");
        span.onclick = async () => {
          try {
            await navigator.clipboard.writeText(el.innerText);
            message.success(t("editor.copySuccess"));
          } catch {
            message.error(t("media.copyFailed"));
          }
        };
        el.parentNode?.insertBefore(span, el);

        const colorGroup = document.createElement("span");
        colorGroup.className = styles.colorGroup;
        el.parentNode?.insertBefore(colorGroup, el);
        ["#dc3545", "#FFBD2E", "#27C93F"].forEach((color) => {
          const dot = document.createElement("i");
          dot.style.backgroundColor = color;
          colorGroup.appendChild(dot);
        });

        cleanups.push(() => {
          span.remove();
          colorGroup.remove();
        });
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((cb) => cb());
    };
  }, [content, darkMode, message, t]);

  return <div ref={ref} className="markdown" />;
}
