import type { Patch, VersionFormat } from "./patch-model";

/** Numero settimana ISO-8601. */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function suggestVersion(
  format: VersionFormat,
  patches: readonly Patch[],
  now: Date = new Date(),
): string {
  if (format === "manual") return "";
  if (format === "yearWeek") {
    const { year, week } = isoWeek(now);
    return `v${String(year).slice(-2)}.${String(week).padStart(2, "0")}`;
  }
  const numbers = patches
    .map((p) => /^v?(\d+)\.(\d+)$/.exec(p.version.trim()))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]) * 1000 + Number(m[2]));
  if (numbers.length === 0) return "v1.0";
  const max = Math.max(...numbers);
  return `v${Math.floor(max / 1000)}.${(max % 1000) + 1}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}
