import { useState } from "react";
import { App, Button } from "antd";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./login-cli-snippet.module.css";

const QUICK_START_LINES = [
  "npm i -g @fecommunity/reactpress@3",
  "reactpress init",
  "reactpress dev",
] as const;

export function LoginCliSnippet() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);
  const command = QUICK_START_LINES.join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error(t("login.cli.copyFailed"));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleBar}>
        <span className={styles.dots} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.title}>{t("login.cli.title")}</span>
        <Button
          type="text"
          size="small"
          className={styles.copyBtn}
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={() => void handleCopy()}
          aria-label={t("login.cli.copyAria")}
        >
          {copied ? t("login.cli.copied") : t("login.cli.copy")}
        </Button>
      </div>
      <pre className={styles.terminal} aria-label={t("login.cli.terminalAria")}>
        <code>
          {QUICK_START_LINES.map((line, index) => (
            <span key={line} className={styles.line}>
              <span className={styles.prompt} aria-hidden>
                $
              </span>
              <span>{line}</span>
              {index === QUICK_START_LINES.length - 1 ? (
                <span className={styles.cursor} aria-hidden>
                  ▋
                </span>
              ) : null}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
