import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { QUICK_START_COMMANDS, QUICK_START_COPY_COMMAND } from '@site/src/constants/quickStartCommands';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';
import { useCliTypewriter } from './useCliTypewriter';

type Variant = 'hero' | 'section';

type Props = {
  variant?: Variant;
  className?: string;
  showHint?: boolean;
  animate?: boolean;
  commands?: readonly string[];
  copyCommand?: string;
};

const SERVICE_ROW_PATTERN = /^(\S+)\s{2,}(https?:\/\/\S+)$/;
const NPM_INSTALL_PATTERN = /^(npm\s+i\s+-g)\s+(.+)$/;

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
      <path d="M6 8H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" />
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

function CommandLine({ text }: { text: string }) {
  const npmMatch = text.match(NPM_INSTALL_PATTERN);
  if (npmMatch) {
    return (
      <>
        <span className={styles.cmdKeyword}>{npmMatch[1]}</span>{' '}
        <span className={styles.cmdPackage}>{npmMatch[2]}</span>
      </>
    );
  }

  if (text.startsWith('reactpress ')) {
    const [, subcommand] = text.split(' ');
    return (
      <>
        <span className={styles.cmdBin}>reactpress</span>{' '}
        <span className={styles.cmdArg}>{subcommand}</span>
      </>
    );
  }

  if (text.includes('mkdir') && text.includes('cd')) {
    return (
      <>
        <span className={styles.cmdKeyword}>mkdir</span>{' '}
        <span className={styles.cmdPath}>my-blog</span>{' '}
        <span className={styles.cmdOperator}>&&</span>{' '}
        <span className={styles.cmdKeyword}>cd</span>{' '}
        <span className={styles.cmdPath}>my-blog</span>
      </>
    );
  }

  return <>{text}</>;
}

function OutputLine({ text }: { text: string }) {
  const tagged = text.match(/^(\[reactpress\])\s*(.*)$/);
  if (tagged) {
    return (
      <span className={styles.outputText}>
        <span className={styles.outputTag}>{tagged[1]}</span>
        <span className={styles.outputMessage}>{tagged[2]}</span>
      </span>
    );
  }

  if (text.startsWith('@fecommunity/')) {
    return <span className={clsx(styles.outputText, styles.outputPackage)}>{text}</span>;
  }

  if (text.startsWith('added ')) {
    return <span className={clsx(styles.outputText, styles.outputMuted)}>{text}</span>;
  }

  return <span className={styles.outputText}>{text}</span>;
}

function SuccessLine({ text }: { text: string }) {
  if (text.startsWith('✓')) {
    return <span className={clsx(styles.successText, styles.successHeadline)}>{text}</span>;
  }

  const serviceMatch = text.match(SERVICE_ROW_PATTERN);
  if (serviceMatch) {
    return (
      <span className={styles.serviceRow}>
        <span className={styles.serviceLabel}>{serviceMatch[1]}</span>
        <span className={styles.serviceUrl}>{serviceMatch[2]}</span>
      </span>
    );
  }

  return <span className={styles.successText}>{text}</span>;
}

function resolveToolbarCwd(
  history: { kind: string; text: string }[],
  activeInput: string,
): string {
  const entered = [
    ...history.filter((line) => line.kind === 'input').map((line) => line.text),
    activeInput,
  ];
  if (entered.some((line) => line.includes('cd my-blog') || line.trim() === 'reactpress init')) {
    return '~/my-blog';
  }
  return '~';
}

export default function CliCommandBlock({
  variant = 'hero',
  className,
  showHint = variant !== 'hero',
  animate = variant === 'hero',
  commands = QUICK_START_COMMANDS,
  copyCommand = QUICK_START_COPY_COMMAND,
}: Props) {
  const { i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale === 'zh' ? 'zh' : 'en';
  const [copied, setCopied] = useState(false);
  const lines = commands.length > 0 ? commands : [...QUICK_START_COMMANDS];

  const { history, activeInput, isTyping, animate: isAnimating } = useCliTypewriter({
    enabled: animate,
    locale,
    commands: lines,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const toolbarCwd = useMemo(() => resolveToolbarCwd(history, activeInput), [history, activeInput]);
  const readyIndex = useMemo(() => history.findIndex((line) => line.kind === 'divider'), [history]);

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
  const isReady = isAnimating && history.some((line) => line.kind === 'success') && !showLiveInput;

  return (
    <div
      className={clsx(styles.wrapper, styles[variant], className)}
      data-variant={variant}
      data-ready={isReady || undefined}
    >
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
            <span className={styles.toolbarSep}>-</span>
            <span className={styles.toolbarCwd}>{toolbarCwd}</span>
            {isReady && (
              <span className={styles.toolbarStatus}>
                <Translate id="home.cli.running">Running</Translate>
              </span>
            )}
          </span>
          <button
            type="button"
            className={clsx(styles.copyBtn, copied && styles.copyBtnDone)}
            onClick={handleCopy}
            aria-label={translate({
              message: 'Copy quick start commands',
              id: 'home.cli.copyAll.aria',
            })}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span>
              {copied ? (
                <Translate id="home.cli.copied">Copied!</Translate>
              ) : (
                <Translate id="home.cli.copyAll">Copy</Translate>
              )}
            </span>
          </button>
        </div>

        <div
          className={clsx(styles.body, isAnimating && styles.bodyAnimated)}
          aria-live={isAnimating ? 'polite' : undefined}
          aria-label={translate({
            message: 'ReactPress quick start command demo',
            id: 'home.cli.terminal.aria',
          })}
        >
          <div ref={scrollRef} className={styles.terminalScroll}>
            {history.map((line, index) => {
              const inReadyBlock = readyIndex >= 0 && index >= readyIndex;
              return (
                <div
                  key={`${line.kind}-${index}-${line.text}`}
                  className={clsx(
                    line.kind === 'input' && styles.commandRow,
                    line.kind === 'output' && styles.outputRow,
                    line.kind === 'success' && styles.successRow,
                    line.kind === 'divider' && styles.dividerRow,
                    inReadyBlock && styles.readyBlock,
                    line.kind === 'success' && index === readyIndex + 1 && styles.readyHeadline,
                  )}
                >
                  {line.kind === 'input' ? (
                    <>
                      <span className={styles.prompt} aria-hidden>
                        $
                      </span>
                      <code className={styles.commandText}>
                        <CommandLine text={line.text} />
                      </code>
                    </>
                  ) : line.kind === 'output' ? (
                    <OutputLine text={line.text} />
                  ) : line.kind === 'divider' ? (
                    <span className={styles.dividerText}>{line.text}</span>
                  ) : (
                    <SuccessLine text={line.text} />
                  )}
                </div>
              );
            })}

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

        {(showHint || variant === 'hero') && (
          <p className={clsx(styles.hint, variant === 'hero' && styles.hintHero)}>
            {showHint ? (
              <Translate id="home.cli.hint">Copy all commands and paste into your terminal to get started</Translate>
            ) : (
              <Translate id="home.cli.footerHint">Copy the script above and paste into Terminal to get started</Translate>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
