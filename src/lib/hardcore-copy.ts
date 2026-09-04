/** Seleziona la voce di sistema senza alterare contenuti scritti dall'utente. */
export function hardcoreCopy(enabled: boolean, standard: string, hardcore: string): string {
  return enabled ? hardcore : standard;
}

export function hardcoreGreeting(enabled: boolean, username: string): string {
  const name = username || "tu";
  return hardcoreCopy(enabled, `Ciao ${name}`, `Cazzo, sei ancora vivo, ${name}`);
}
