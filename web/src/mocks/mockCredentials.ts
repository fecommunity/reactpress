const credentials = new Map<string, string>([["admin", "admin"]]);

export function setMockCredential(username: string, password: string): void {
  credentials.set(username, password);
}

export function verifyMockCredential(username: string, password: string): boolean {
  const stored = credentials.get(username);
  return stored !== undefined && stored === password;
}
