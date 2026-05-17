import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Translate, { translate } from '@docusaurus/Translate';
import {
  QUICK_START_COMMANDS,
  QUICK_START_COPY_COMMAND,
} from '@site/src/constants/quickStartCommands';
import { useCliTypewriter } from './useCliTypewriter';
import styles from './styles.module.css';

type Variant = 'hero' | 'section';

type Props = {
  variant?: Variant;
  className?: string;
  showHint?: boolean;
  /** 首页 hero 默认开启打字机动画 */
  animate?: boolean;
  /** 展示的命令行；默认完整快速开始流程 */
  commands?: readonly string[];
  /** 复制到剪贴板的内容；默认与展示命令一致（多行脚本） */
  copyCommand?: string;
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

function TerminalCursor() {
  return <span className={styles.cursor} aria-hidden />;
}

export default function CliCommandBlock({
  variant = 'hero',
  className,
  showHint = variant !== 'hero',
  animate = variant === 'hero',
  commands = QUICK_START_COMMANDS,
  copyCommand = QUICK_START_COPY_COMMAND,
}: Props) {
  const [copied, setCopied] = useState(false);
  const lines =
    commands.length > 0 ? commands : [...QUICK_START_COMMANDS];

  const { history, activeInput, isTyping, animate: isAnimating } =
    useCliTypewriter({
      enabled: animate,
      commands: lines,
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (isAnimating && el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [history, activeInput, isAnimating]);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(copyCommand);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [copyCommand]);

  const showLiveInput = isAnimating && isTyping;
  const isReady =
    isAnimating &&
    history.some((line) => line.kind === 'success') &&
    !showLiveInput;

  return (
    <div
      className={clsx(styles.wrapper, styles[variant], className)}
      data-variant={variant}
      data-ready={isReady || undefined}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.dots} aria-hidden>
            <span />
            <span />
            <span className={clsx(isReady && styles.dotLive)} />
          </div>
          <span className={styles.toolbarTitle}>
            <Translate id="home.cli.title">reactpress</Translate>
            {isReady && (
              <span className={styles.toolbarStatus}>
                <Translate id="home.cli.running">运行中</Translate>
              </span>
            )}
          </span>
          <button
            type="button"
            className={clsx(styles.copyBtn, copied && styles.copyBtnDone)}
            onClick={handleCopy}
            aria-label={translate({
              message: '复制快速开始命令',
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

        <div
          className={clsx(styles.body, isAnimating && styles.bodyAnimated)}
          aria-live={isAnimating ? 'polite' : undefined}
          aria-label={translate({
            message: 'ReactPress 快速开始命令演示',
            id: 'home.cli.terminal.aria',
          })}>
          <div ref={scrollRef} className={styles.terminalScroll}>
            {history.map((line, index) => (
              <div
                key={`${line.kind}-${index}-${line.text}`}
                className={clsx(
                  line.kind === 'input' && styles.commandRow,
                  line.kind === 'output' && styles.outputRow,
                  line.kind === 'success' && styles.successRow,
                )}>
                {line.kind === 'input' ? (
                  <>
                    <span className={styles.prompt} aria-hidden>
                      $
                    </span>
                    <code className={styles.commandText}>{line.text}</code>
                  </>
                ) : (
                  <span
                    className={clsx(
                      line.kind === 'output' && styles.outputText,
                      line.kind === 'success' && styles.successText,
                    )}>
                    {line.text}
                  </span>
                )}
              </div>
            ))}

            {showLiveInput && (
              <div className={styles.commandRow}>
                <span className={styles.prompt} aria-hidden>
                  $
                </span>
                <code className={styles.commandText}>
                  {activeInput}
                  <TerminalCursor />
                </code>
              </div>
            )}

          </div>
        </div>

        {showHint && (
          <p className={styles.hint}>
            <Translate id="home.cli.hint">
              复制全部命令，粘贴到终端按序执行即可起站
            </Translate>
          </p>
        )}
      </div>
    </div>
  );
}
