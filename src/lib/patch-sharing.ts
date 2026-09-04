import type { Patch } from "@/lib/patch-model";

export const EXPORT_SIZES = {
  vertical: {
    width: 540,
    height: 675,
    output: "1080×1350",
    label: "Post",
    hint: "Instagram e Facebook",
  },
  story: {
    width: 540,
    height: 960,
    output: "1080×1920",
    label: "Storia / Reel",
    hint: "Instagram, TikTok e WhatsApp",
  },
  square: {
    width: 540,
    height: 540,
    output: "1080×1080",
    label: "Quadrato",
    hint: "Feed e messaggi",
  },
  horizontal: {
    width: 600,
    height: 337.5,
    output: "1200×675",
    label: "Orizzontale",
    hint: "Facebook, chat e link",
  },
} as const;

export function isPatchShareable(patch: Pick<Patch, "status">): boolean {
  return patch.status === "published";
}

export function parseShareRequest(value: unknown): boolean {
  return value === true || value === "true" || value === "1";
}
