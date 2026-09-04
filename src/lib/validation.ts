import { APP_CONFIG } from "@/config/app-config";
import { cleanPatch, type Patch, type PatchStatus } from "./patch-model";
import { usernameHasWhitespace } from "./username.ts";

export interface PatchErrors {
  title?: string;
  version?: string;
  sections?: string;
}

export function validatePatch(patch: Patch, target: PatchStatus): PatchErrors {
  const errors: PatchErrors = {};
  const title = patch.title.trim();
  const version = patch.version.trim();

  if (title.length === 0) errors.title = "Il titolo è obbligatorio.";
  else if (title.length > APP_CONFIG.limits.title)
    errors.title = `Massimo ${APP_CONFIG.limits.title} caratteri.`;

  if (version.length === 0) errors.version = "La versione è obbligatoria.";
  else if (version.length > APP_CONFIG.limits.version)
    errors.version = `Massimo ${APP_CONFIG.limits.version} caratteri.`;

  if (target === "published") {
    const filledItems = patch.sections.flatMap((section) =>
      section.items.map((item) => item.text.trim()).filter(Boolean),
    );
    if (filledItems.length === 0)
      errors.sections = "Per pubblicare serve almeno una sezione con un elemento compilato.";
    else if (filledItems.some((text) => text.length < APP_CONFIG.limits.minItemText))
      errors.sections = `Ogni voce compilata deve contenere almeno ${APP_CONFIG.limits.minItemText} caratteri.`;
    else if (cleanPatch(patch).sections.length === 0)
      errors.sections = "Per pubblicare serve almeno una sezione con un elemento compilato.";
  }

  return errors;
}

export function hasErrors(errors: PatchErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validateDisplayName(name: string): string | undefined {
  const v = name.trim();
  if (v.length < APP_CONFIG.limits.minDisplayName)
    return `Inserisci almeno ${APP_CONFIG.limits.minDisplayName} caratteri.`;
  if (v.length > APP_CONFIG.limits.displayName)
    return `Massimo ${APP_CONFIG.limits.displayName} caratteri.`;
  if (usernameHasWhitespace(v)) return "Lo username non può contenere spazi.";
  return undefined;
}
