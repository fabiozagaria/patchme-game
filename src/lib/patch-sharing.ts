import type { Patch } from "@/lib/patch-model";

export const EXPORT_SIZES = {
  vertical: { width: 540, height: 675, output: "1080×1350" },
  horizontal: { width: 600, height: 337.5, output: "1200×675" },
} as const;

export function isPatchShareable(patch: Pick<Patch, "status">): boolean {
  return patch.status === "published";
}

export function parseShareRequest(value: unknown): boolean {
  return value === true || value === "true" || value === "1";
}
