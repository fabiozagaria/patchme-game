import { z } from "zod";
import type { SectionCategory } from "@/config/app-config";

export type PatchStatus = "draft" | "published";
export type VersionFormat = "yearWeek" | "sequential" | "manual";
export type ThemeMode = "dark" | "light" | "system";
export type ShareOrientation = "vertical" | "horizontal";
export type ProfileAvatar = "hello" | "thinking" | "celebrate" | "bug" | "superSaiyan" | "hardcore";

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
  shareVisible: z.boolean().default(true),
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
  profileAvatar: z
    .enum(["hello", "thinking", "celebrate", "bug", "superSaiyan", "hardcore"])
    .default("hello"),
  unlockedAvatars: z.array(z.enum(["superSaiyan", "hardcore"])).default([]),
  hardcoreMode: z.boolean().default(false),
  soundEffects: z.boolean().default(true),
  updateNotifications: z.boolean().default(false),
  lastNotifiedVersion: z.string().default(""),
  displayNameChanges: z.array(z.string()).default([]),
  onboarded: z.boolean(),
  productTourSeen: z.boolean().default(false),
  lastSeenVersion: z.string().default(""),
  shareTemplate: z.enum(["classic", "terminal", "rpg", "chaos"]).default("classic"),
  shareOrientation: z.enum(["vertical", "horizontal"]).default("vertical"),
});

export type PatchItem = z.infer<typeof patchItemSchema>;
export type PatchSection = z.infer<typeof patchSectionSchema>;
export type Patch = z.infer<typeof patchSchema>;
export type AppSettings = z.infer<typeof settingsSchema>;
export type ShareTemplate = AppSettings["shareTemplate"];

export const ACCENTS: readonly { id: string; label: string; value: string }[] = [
  { id: "lime", label: "Verde acido", value: "oklch(0.84 0.19 128)" },
  { id: "cyan", label: "Ciano", value: "oklch(0.82 0.13 208)" },
  { id: "amber", label: "Ambra", value: "oklch(0.83 0.16 78)" },
  { id: "magenta", label: "Magenta", value: "oklch(0.75 0.19 350)" },
  { id: "violet", label: "Viola", value: "oklch(0.74 0.16 296)" },
  { id: "blue", label: "Blu elettrico", value: "oklch(0.68 0.19 252)" },
  { id: "red", label: "Rosso", value: "oklch(0.66 0.22 27)" },
  { id: "orange", label: "Arancione", value: "oklch(0.76 0.18 55)" },
  { id: "rose", label: "Rosa", value: "oklch(0.73 0.18 10)" },
  { id: "silver", label: "Argento", value: "oklch(0.78 0.02 255)" },
];

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: "",
  versionFormat: "yearWeek",
  theme: "dark",
  accent: "oklch(0.84 0.19 128)",
  profileAvatar: "hello",
  unlockedAvatars: [],
  hardcoreMode: false,
  soundEffects: true,
  updateNotifications: false,
  lastNotifiedVersion: "",
  displayNameChanges: [],
  onboarded: false,
  productTourSeen: false,
  lastSeenVersion: "",
  shareTemplate: "classic",
  shareOrientation: "vertical",
};

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSection(category: SectionCategory, title: string): PatchSection {
  return {
    id: createId(),
    category,
    title,
    items: [{ id: createId(), text: "" }],
    shareVisible: true,
  };
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
