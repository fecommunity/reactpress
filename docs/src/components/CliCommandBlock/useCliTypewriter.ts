import {
  getQuickStartDemoOutputs,
  getQuickStartDevReadyLines,
  QUICK_START_COMMANDS,
  QUICK_START_READY_DIVIDER,
  type QuickStartLocale,
} from '@site/src/constants/quickStartCommands';
import { useEffect, useMemo, useState } from 'react';

export type TerminalLine = {
  kind: 'input' | 'output' | 'success' | 'divider';
  text: string;
};

type Options = {
  enabled: boolean;
  locale?: QuickStartLocale;
  commands?: readonly string[];
  loop?: boolean;
  charDelayMs?: number;
  linePauseMs?: number;
  outputDelayMs?: number;
  holdMs?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildStaticTerminal(
  commands: readonly string[],
  locale: QuickStartLocale,
): TerminalLine[] {
  const demoOutputs = getQuickStartDemoOutputs(locale);
  const readyLines = getQuickStartDevReadyLines(locale);
  const lines: TerminalLine[] = [];
  for (const cmd of commands) {
    lines.push({ kind: 'input', text: cmd });
    for (const out of demoOutputs[cmd] ?? []) {
      lines.push({ kind: 'output', text: out });
    }
  }
  lines.push({ kind: 'divider', text: QUICK_START_READY_DIVIDER });
  for (const line of readyLines) {
    lines.push({ kind: 'success', text: line });
  }
  return lines;
}

export function useCliTypewriter({
  enabled,
  locale = 'en',
  commands = QUICK_START_COMMANDS,
  loop = true,
  charDelayMs = 40,
  linePauseMs = 380,
  outputDelayMs = 120,
  holdMs = 4500,
}: Options) {
  const demoOutputs = useMemo(
    () => getQuickStartDemoOutputs(locale),
    [locale],
  );
  const readyLines = useMemo(
    () => getQuickStartDevReadyLines(locale),
    [locale],
  );
  const staticLines = useMemo(
    () => buildStaticTerminal(commands, locale),
    [commands, locale],
  );

  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [activeInput, setActiveInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const animate = enabled && !reduceMotion;

  useEffect(() => {
    if (!animate) {
      setHistory(staticLines);
      setActiveInput('');
      setIsTyping(false);
      return;
    }

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const run = async () => {
      do {
        if (cancelled) {
          return;
        }

        setHistory([]);
        setActiveInput('');
        setIsTyping(true);

        for (const cmd of commands) {
          if (cancelled) {
            return;
          }

          for (let i = 0; i <= cmd.length; i += 1) {
            if (cancelled) {
              return;
            }
            setActiveInput(cmd.slice(0, i));
            if (i < cmd.length) {
              await wait(charDelayMs);
            }
          }

          setHistory((prev) => [...prev, { kind: 'input', text: cmd }]);
          setActiveInput('');
          await wait(linePauseMs);

          for (const out of demoOutputs[cmd] ?? []) {
            if (cancelled) {
              return;
            }
            await wait(outputDelayMs);
            setHistory((prev) => [...prev, { kind: 'output', text: out }]);
          }
        }

        if (cancelled) {
          return;
        }
        await wait(outputDelayMs);
        setHistory((prev) => [...prev, { kind: 'divider', text: QUICK_START_READY_DIVIDER }]);

        for (const line of readyLines) {
          if (cancelled) {
            return;
          }
          await wait(outputDelayMs);
          setHistory((prev) => [...prev, { kind: 'success', text: line }]);
        }

        setIsTyping(false);
        await wait(holdMs);
      } while (loop && !cancelled);
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    animate,
    commands,
    demoOutputs,
    readyLines,
    staticLines,
    loop,
    charDelayMs,
    linePauseMs,
    outputDelayMs,
    holdMs,
  ]);

  return {
    animate,
    history: animate ? history : staticLines,
    activeInput: animate ? activeInput : '',
    isTyping: animate && isTyping,
  };
}
