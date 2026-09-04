import type { Patch } from "@/lib/patch-model";

export function isPatchShareable(patch: Pick<Patch, "status">): boolean {
  return patch.status === "published";
}

export function parseShareRequest(value: unknown): boolean {
  return value === true || value === "true" || value === "1";
}
