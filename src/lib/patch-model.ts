import { z } from "zod";
import type { SectionCategory } from "@/config/app-config";

export type PatchStatus = "draft" | "published";
export type VersionFormat = "yearWeek" | "sequential" | "manual";
export type ThemeMode = "dark" | "light" | "system";

export const sectionCategorySchema = z.enum([
  "news",
  "improvements",
  "fixes",
  "known",
  "removed",
  "next",
  "custom",
]);

export const patchItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const patchSectionSchema = z.object({
  id: z.string(),
  category: sectionCategorySchema,
  title: z.string(),
  items: z.array(patchItemSchema),
});

export const patchSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.string(),
  date: z.string(),
  status: z.enum(["draft", "published"]),
  sections: z.array(patchSectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const settingsSchema = z.object({
  displayName: z.string(),
  versionFormat: z.enum(["yearWeek", "sequential", "manual"]),
  theme: z.enum(["dark", "light", "system"]),
  accent: z.string(),
  onboarded: z.boolean(),
});

export type PatchItem = z.infer<typeof patchItemSchema>;
export type PatchSection = z.infer<typeof patchSectionSchema>;
export type Patch = z.infer<typeof patchSchema>;
export type AppSettings = z.infer<typeof settingsSchema>;

export const ACCENTS: readonly { id: string; label: string; value: string }[] = [
  { id: "lime", label: "Verde acido", value: "oklch(0.84 0.19 128)" },
  { id: "cyan", label: "Ciano", value: "oklch(0.82 0.13 208)" },
  { id: "amber", label: "Ambra", value: "oklch(0.83 0.16 78)" },
  { id: "magenta", label: "Magenta", value: "oklch(0.75 0.19 350)" },
  { id: "violet", label: "Viola", value: "oklch(0.74 0.16 296)" },
];

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: "",
  versionFormat: "yearWeek",
  theme: "dark",
  accent: ACCENTS[0].value,
  onboarded: false,
};

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSection(category: SectionCategory, title: string): PatchSection {
  return { id: createId(), category, title, items: [{ id: createId(), text: "" }] };
}

export function sectionHasContent(section: PatchSection): boolean {
  return section.items.some((i) => i.text.trim().length > 0);
}

/** Rimuove elementi vuoti e sezioni senza contenuto utile. */
export function cleanPatch(patch: Patch): Patch {
  return {
    ...patch,
    title: patch.title.trim(),
    version: patch.version.trim(),
    sections: patch.sections
      .map((s) => ({
        ...s,
        title: s.title.trim(),
        items: s.items.map((i) => ({ ...i, text: i.text.trim() })).filter((i) => i.text.length > 0),
      }))
      .filter((s) => s.items.length > 0),
  };
}
