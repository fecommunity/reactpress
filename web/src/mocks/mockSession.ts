let currentMockUsername: string | null = null;

export function setMockSessionUsername(username: string | null): void {
  currentMockUsername = username;
}

export function getMockSessionUsername(): string | null {
  return currentMockUsername;
}
