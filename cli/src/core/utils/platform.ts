import { platform } from 'node:os';

export function isWindows(): boolean {
  return platform() === 'win32';
}

export function isMac(): boolean {
  return platform() === 'darwin';
}

export function getDockerComposeCommand(): string {
  return isWindows() ? 'docker-compose.exe' : 'docker-compose';
}

export function getNpmCommand(): string {
  return isWindows() ? 'npm.cmd' : 'npm';
}

export function getNpxCommand(): string {
  return isWindows() ? 'npx.cmd' : 'npx';
}

export function getNodeCommand(): string {
  return process.execPath;
}
