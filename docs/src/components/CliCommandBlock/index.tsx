import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import Translate, { translate } from '@docusaurus/Translate';
import { QUICK_START_INSTALL_COMMAND } from '@site/src/constants/quickStartCommands';
import styles from './styles.module.css';

type Variant = 'hero' | 'section';

type Props = {
  variant?: Variant;
  className?: string;
  showHint?: boolean;
  /** 展示的命令行；默认仅全局安装命令 */
  commands?: readonly string[];
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V8.83a2 2 0 00-.59-1.41l-4.83-4.83A2 2 0 0013.17 2H10a2 2 0 00-2 2z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 8H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CliCommandBlock({
  variant = 'hero',
  className,
  showHint = variant !== 'hero',
  commands = [QUICK_START_INSTALL_COMMAND],
}: Props) {
  const [copied, setCopied] = useState(false);
  const command = commands[0] ?? QUICK_START_INSTALL_COMMAND;

  const handleCopy = useCallback(async () => {
    const ok = await copyText(command);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [command]);

  return (
    <div
      className={clsx(styles.wrapper, styles[variant], className)}
      data-variant={variant}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.dots} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className={styles.toolbarTitle}>
            <Translate id="home.cli.title">reactpress</Translate>
          </span>
          <button
            type="button"
            className={clsx(styles.copyBtn, copied && styles.copyBtnDone)}
            onClick={handleCopy}
            aria-label={translate({
              message: '复制安装命令',
              id: 'home.cli.copyAll.aria',
            })}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span>
              {copied ? (
                <Translate id="home.cli.copied">已复制</Translate>
              ) : (
                <Translate id="home.cli.copyAll">复制</Translate>
              )}
            </span>
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.commandRow}>
            <span className={styles.prompt} aria-hidden>
              $
            </span>
            <code className={styles.commandText}>{command}</code>
          </div>
        </div>
        {showHint && (
          <p className={styles.hint}>
            <Translate id="home.cli.hint">
              全局安装后，在空目录初始化，约 1 分钟即可零配置起站
            </Translate>
          </p>
        )}
      </div>
    </div>
  );
}
