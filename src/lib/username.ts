export function usernameHasWhitespace(value: string): boolean {
  return /\s/u.test(value);
}

/** Confronto stabile per gli easter egg, inclusi i vecchi username con spazi. */
export function normalizeUsername(value: string): string {
  return value.trim().toLocaleLowerCase("it").replace(/\s+/gu, "");
}
