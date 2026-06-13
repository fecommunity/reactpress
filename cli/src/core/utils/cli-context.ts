let projectCwd: string | undefined;

export function setProjectCwd(cwd?: string): void {
  projectCwd = cwd ? cwd : undefined;
}

export function getProjectCwd(): string {
  return projectCwd ?? process.cwd();
}
