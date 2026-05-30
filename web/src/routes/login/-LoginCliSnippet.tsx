import { App, Button } from "antd";
import classNames from "classnames";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { useAppLocale } from "@/hooks/useAppLocale";
import { REACTPRESS_GITHUB_URL } from "@/utils/constants";

import {
  LOGIN_CYBER_COMMANDS,
  LOGIN_CYBER_LOGO,
  LOGIN_CYBER_LOGO_GRADIENTS,
  REACTPRESS_CLI_VERSION,
} from "./-loginCyberLogo";
import styles from "./login-cli-snippet.module.css";

const QUICK_START_LINES = [
  "npm i -g @fecommunity/reactpress@3",
  "reactpress init",
  "reactpress dev",
] as const;

const REPO_DISPLAY = "github.com/fecommunity/reactpress";

const PULSE_SEGMENTS = 28;

type LoginCliSnippetProps = {
  /** 与 Hero 同屏时压缩布局，避免遮挡底部场景与 highlights */
  compact?: boolean;
};

export function LoginCliSnippet({ compact = false }: LoginCliSnippetProps) {
  const { t } = useAppLocale();
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
    <div className={classNames(styles.wrap, compact && styles.compact)}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.frame} role="region" aria-label={t("login.cyberTerminal.aria")}>
        <div className={styles.topEdge}>
          <span className={styles.topDash} aria-hidden />
          <span className={styles.topTitle}>
            <span className={styles.bracket}>[</span>{" "}
            <span className={styles.brandMark}>REACTPRESS</span>{" "}
            <span className={styles.dot}>·</span>{" "}
            <span className={styles.version}>v{REACTPRESS_CLI_VERSION}</span>{" "}
            <span className={styles.bracket}>]</span>
          </span>
          <span className={styles.topDash} aria-hidden />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelToolbar}>
            <a
              className={styles.repoLink}
              href={REACTPRESS_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={11} aria-hidden />
              <span>{REPO_DISPLAY}</span>
            </a>
            <Button
              type="text"
              size="small"
              className={styles.copyBtn}
              icon={copied ? <Check size={13} /> : <Copy size={13} />}
              onClick={() => void handleCopy()}
              aria-label={t("login.cli.copyAria")}
            >
              {copied ? t("login.cli.copied") : t("login.cli.copy")}
            </Button>
          </div>

          <div className={styles.logoBlock}>
            {!compact ? (
              <pre className={styles.logo} aria-hidden>
                {LOGIN_CYBER_LOGO.map((line, index) => (
                  <span key={line} className={styles[LOGIN_CYBER_LOGO_GRADIENTS[index]]}>
                    {line}
                  </span>
                ))}
              </pre>
            ) : null}
            <p className={styles.wordmark} aria-hidden={!compact}>
              <span className={styles.wordmarkDecor}>▌▍▎</span>{" "}
              <span className={styles.wordmarkText}>REACTPRESS</span>{" "}
              <span className={styles.wordmarkDecor}>▎▍▌</span>
            </p>
            {!compact ? <div className={styles.scanline} aria-hidden /> : null}
          </div>

          <div className={styles.commandBlock} aria-label={t("login.cli.terminalAria")}>
            <p className={styles.commandHeading}>
              <span className={styles.commandHeadingIcon} aria-hidden>
                ◇
              </span>
              {t("login.cli.quickStart")}
            </p>
            <pre className={styles.commandLines}>
              <code>
                {QUICK_START_LINES.map((line, index) => (
                  <span key={line} className={styles.commandRow}>
                    <span className={styles.prompt} aria-hidden>
                      $
                    </span>
                    <span className={styles.commandText}>{line}</span>
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

          {compact ? (
            <div className={styles.metaCompact}>
              <span className={styles.metaCompactSubtitle}>
                <span className={styles.subtitleIcon} aria-hidden>
                  ◆
                </span>
                {t("login.cyberTerminal.subtitle")}
              </span>
              <span className={styles.modeChip}>{t("login.cyberTerminal.modeStandalone")}</span>
              <span className={styles.metaCompactSystem}>
                <span className={styles.statusLights} aria-hidden>
                  <span className={styles.lightOn} />
                  <span className={styles.lightWarn} />
                  <span className={styles.lightOff} />
                </span>
                {t("login.cyberTerminal.systemLabel")}{" "}
                <span className={styles.systemOnline}>{t("login.cyberTerminal.systemOnline")}</span>
              </span>
            </div>
          ) : (
            <div className={styles.metaRow}>
              <div className={styles.metaLeft}>
                <p className={styles.subtitle}>
                  <span className={styles.subtitleIcon} aria-hidden>
                    ◆
                  </span>
                  {t("login.cyberTerminal.subtitle")}
                </p>
                <ul className={styles.infoList}>
                  <li>
                    <span className={styles.infoIcon} aria-hidden>
                      ◇
                    </span>
                    <span className={styles.infoLabel}>{t("login.cyberTerminal.modeLabel")}</span>
                    <span className={styles.modeChip}>
                      {t("login.cyberTerminal.modeStandalone")}
                    </span>
                  </li>
                  <li>
                    <span className={styles.infoIcon} aria-hidden>
                      ◇
                    </span>
                    <span className={styles.infoLabel}>{t("login.cyberTerminal.pathLabel")}</span>
                    <span className={styles.pathValue}>
                      <span className={styles.pathArrow} aria-hidden>
                        ▸
                      </span>{" "}
                      ~
                    </span>
                  </li>
                  <li>
                    <span className={styles.infoIcon} aria-hidden>
                      ◇
                    </span>
                    <span className={styles.infoLabel}>{t("login.cyberTerminal.pulseLabel")}</span>
                    <span className={styles.pulseWrap}>
                      <span className={styles.pulseBar} aria-hidden>
                        {Array.from({ length: PULSE_SEGMENTS }, (_, i) => (
                          <span key={i} className={styles.pulseOn} />
                        ))}
                      </span>
                      <span className={styles.pulseReady}>
                        {t("login.cyberTerminal.pulseReady")}
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              <div className={styles.metaRight}>
                <span className={styles.statusLights} aria-hidden>
                  <span className={styles.lightOn} />
                  <span className={styles.lightWarn} />
                  <span className={styles.lightOff} />
                </span>
                <span className={styles.systemText}>
                  {t("login.cyberTerminal.systemLabel")}{" "}
                  <span className={styles.systemOnline}>
                    {t("login.cyberTerminal.systemOnline")}
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className={styles.panelFooter}>
            <div className={styles.bottomEdge} aria-hidden />
            <nav className={styles.commandRail} aria-label={t("login.cyberTerminal.railAria")}>
              {LOGIN_CYBER_COMMANDS.map((name, index) => (
                <span key={name} className={index % 2 === 0 ? styles.cmdPrimary : styles.cmdAccent}>
                  <span className={styles.cmdChevron} aria-hidden>
                    ⟫
                  </span>{" "}
                  {name}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
