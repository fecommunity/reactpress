import fs from "node:fs";
import path from "node:path";

import { app } from "electron";

const LOG_DIR_NAME = "logs";
const MAX_LOG_BYTES = 5 * 1024 * 1024;

let logDir: string | null = null;
let logFilePath: string | null = null;
let logStream: fs.WriteStream | null = null;

function isDebugVerbose(): boolean {
  return process.env.REACTPRESS_DESKTOP_DEBUG === "1";
}

function formatDateStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveLogFilePath(dir: string): string {
  return path.join(dir, `system-${formatDateStamp()}.log`);
}

function rotateIfNeeded(filePath: string): void {
  try {
    const size = fs.statSync(filePath).size;
    if (size < MAX_LOG_BYTES) return;
    const rotated = `${filePath}.${Date.now()}.old`;
    fs.renameSync(filePath, rotated);
  } catch {
    // ignore missing file
  }
}

function openLogStream(dir: string): void {
  const filePath = resolveLogFilePath(dir);
  rotateIfNeeded(filePath);
  logFilePath = filePath;
  logStream = fs.createWriteStream(filePath, { flags: "a", encoding: "utf8" });
  logStream.on("error", (err) => {
    console.error("[ReactPress Desktop] Log write failed:", err.message);
  });
}

function writeRaw(line: string): void {
  if (!logStream) return;
  logStream.write(`${line}\n`);
}

function formatLine(level: string, source: string, message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] [${source}] ${message}`;
}

function mirrorToConsole(level: string, source: string, message: string): void {
  if (!isDebugVerbose()) return;
  const text = `[ReactPress Desktop:${source}] ${message}`;
  if (level === "ERROR") console.error(text);
  else if (level === "WARN") console.warn(text);
  else console.log(text);
}

export function initSystemLog(userDataPath: string): void {
  if (logStream) return;

  logDir = path.join(userDataPath, LOG_DIR_NAME);
  fs.mkdirSync(logDir, { recursive: true });
  openLogStream(logDir);

  const version = app.getVersion();
  const packaged = app.isPackaged && process.env.ELECTRON_IS_DEV !== "1";
  logInfo("main", `ReactPress Desktop starting (v${version}, packaged=${packaged})`);
  logInfo("main", `userData=${userDataPath}`);
  logInfo("main", `logFile=${logFilePath ?? "unknown"}`);
  if (isDebugVerbose()) {
    logInfo("main", "REACTPRESS_DESKTOP_DEBUG=1 — verbose console mirroring enabled");
  }

  process.on("uncaughtException", (err) => {
    logError("main", `uncaughtException: ${err.stack ?? err.message}`);
  });
  process.on("unhandledRejection", (reason) => {
    const text = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
    logError("main", `unhandledRejection: ${text}`);
  });
}

export function getSystemLogDirectory(): string | null {
  return logDir;
}

export function getSystemLogFilePath(): string | null {
  return logFilePath;
}

export function isDesktopDebugVerbose(): boolean {
  return isDebugVerbose();
}

export function logInfo(source: string, message: string): void {
  const line = formatLine("INFO", source, message);
  writeRaw(line);
  mirrorToConsole("INFO", source, message);
}

export function logWarn(source: string, message: string): void {
  const line = formatLine("WARN", source, message);
  writeRaw(line);
  mirrorToConsole("WARN", source, message);
}

export function logError(source: string, message: string): void {
  const line = formatLine("ERROR", source, message);
  writeRaw(line);
  mirrorToConsole("ERROR", source, message);
}

/** Pipe child stdout/stderr into the system log (full text, not filtered). */
export function attachChildProcessLogging(
  child: { stdout?: NodeJS.ReadableStream | null; stderr?: NodeJS.ReadableStream | null; pid?: number },
  source: string,
): void {
  const pid = child.pid ?? "unknown";
  logInfo(source, `process started (pid=${pid})`);

  const onChunk = (stream: "stdout" | "stderr", chunk: Buffer | string) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const level = stream === "stderr" ? "WARN" : "INFO";
      const formatted = formatLine(level, source, trimmed);
      writeRaw(formatted);
      if (isDebugVerbose()) {
        if (level === "WARN") console.warn(`[ReactPress Desktop:${source}]`, trimmed);
        else console.log(`[ReactPress Desktop:${source}]`, trimmed);
      }
    }
  };

  if (child.stdout) {
    child.stdout.on("data", (chunk: Buffer) => onChunk("stdout", chunk));
  }
  if (child.stderr) {
    child.stderr.on("data", (chunk: Buffer) => onChunk("stderr", chunk));
  }
}

export function closeSystemLog(): void {
  if (logStream) {
    logInfo("main", "ReactPress Desktop shutting down");
    logStream.end();
    logStream = null;
  }
}
