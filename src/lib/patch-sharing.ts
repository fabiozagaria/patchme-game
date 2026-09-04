import type { Patch } from "@/lib/patch-model";

export function isPatchShareable(patch: Pick<Patch, "status">): boolean {
  return patch.status === "published";
}
