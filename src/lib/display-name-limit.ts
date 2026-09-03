import { APP_CONFIG } from "@/config/app-config";

function localDay(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todaysDisplayNameChanges(history: readonly string[], now = new Date()): string[] {
  const today = localDay(now);
  return history.filter((entry) => {
    const date = new Date(entry);
    return !Number.isNaN(date.getTime()) && localDay(date) === today;
  });
}

export function remainingDisplayNameChanges(history: readonly string[]): number {
  return Math.max(
    0,
    APP_CONFIG.limits.dailyDisplayNameChanges - todaysDisplayNameChanges(history).length,
  );
}
