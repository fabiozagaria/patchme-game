export const USERNAME_CHANGE_PRICE = 200;

export function usernameChangeCost(completedChanges: number): number {
  return completedChanges <= 0 ? 0 : USERNAME_CHANGE_PRICE;
}

export function canAffordUsernameChange(bits: number, completedChanges: number): boolean {
  return Math.max(0, Math.floor(bits)) >= usernameChangeCost(completedChanges);
}
