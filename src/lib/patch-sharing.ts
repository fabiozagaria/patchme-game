import type { Patch, PatchSubject, PatchTone, ShareTemplate } from "@/lib/patch-model";

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

export function patchSubjectLabel(subject: PatchSubject, targetName = ""): string {
  const target = targetName.trim();
  if (subject === "friend")
    return target ? `Patch dedicata a ${target}` : "Patch dedicata a un amico";
  if (subject === "group") return target ? `Patch del gruppo ${target}` : "Patch di gruppo";
  if (subject === "situation")
    return target ? `Patch della situazione: ${target}` : "Patch di una situazione";
  return "Patch personale";
}

export function createCounterPatchUrl(
  baseUrl: string,
  author: string,
  tone: PatchTone,
  template: ShareTemplate,
): string {
  const params = new URLSearchParams({
    counter: "1",
    subject: "friend",
    target: author.slice(0, 50),
    tone,
    template,
  });
  return `${baseUrl.replace(/\/$/, "")}/patch/new?${params.toString()}`;
}
