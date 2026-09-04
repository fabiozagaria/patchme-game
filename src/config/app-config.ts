/**
 * Configurazione centrale di PatchMe.
 * Tutto ciò che riguarda marchio, firma, testi e categorie vive qui,
 * così l'app può essere personalizzata senza toccare la logica.
 */

export const APP_CONFIG = {
  name: "PatchMe",
  tagline: "Trasforma persone e momenti in patch notes",
  // Incrementare a ogni aggiornamento visibile: attiva automaticamente il popup Novità.
  version: "0.7.1",
  releaseChannel: "Alpha",
  changelog: {
    date: "4 settembre 2026",
    title: "Patchy ti paga anche solo per esserti presentato.",
    items: [
      "Bonus giornaliero di 25 XP e 3 Bit al primo accesso del giorno",
      "Ricompensa protetta da refresh e navigazioni ripetute",
      "Disclaimer più chiaro sui 44 Bit iniziali per tutti i profili locali",
      "Notifiche Android/browser facoltative per le nuove versioni",
      "Permesso notifiche richiesto soltanto dopo un'azione esplicita",
      "Nessun login necessario finché progressi e Bit rimangono sul dispositivo",
    ],
  },
  links: {
    github: "https://github.com/fabiozagaria/patchme-game",
    portfolio: "https://fabio-zagaria-portfolio.vercel.app",
    telegram: "https://t.me/patchmegame",
  },
  signature: {
    enabled: true,
    lines: ["fabio", "zagaria", "dev"] as const,
    durationMs: 1200,
  },
  storageKeys: {
    settings: "patchme.settings.v1",
    patches: "patchme.patches.v1",
    weeklyDraft: "patchme.weekly.draft.v1",
  },
  limits: {
    title: 80,
    version: 20,
    itemText: 280,
    minItemText: 3,
    minDisplayName: 3,
    sectionTitle: 40,
    displayName: 40,
    dailyDisplayNameChanges: 5,
  },
} as const;

export type SectionCategory =
  "news" | "improvements" | "fixes" | "known" | "removed" | "next" | "custom";

export interface SectionPreset {
  category: SectionCategory;
  label: string;
  hint: string;
  /** Token colore accessibile definito in styles.css */
  token: string;
}

export const SECTION_PRESETS: readonly SectionPreset[] = [
  { category: "news", label: "Novità", hint: "Cosa è arrivato di nuovo", token: "cat-news" },
  {
    category: "improvements",
    label: "Miglioramenti",
    hint: "Cosa è migliorato",
    token: "cat-improvements",
  },
  { category: "fixes", label: "Correzioni", hint: "Cosa hai sistemato", token: "cat-fixes" },
  {
    category: "known",
    label: "Bug conosciuti",
    hint: "Cosa resta da risolvere",
    token: "cat-known",
  },
  {
    category: "removed",
    label: "Funzionalità rimosse",
    hint: "Cosa hai smesso di fare",
    token: "cat-removed",
  },
  {
    category: "next",
    label: "Prossimo aggiornamento",
    hint: "Cosa arriva dopo",
    token: "cat-next",
  },
  {
    category: "custom",
    label: "Sezione personalizzata",
    hint: "Titolo libero",
    token: "cat-custom",
  },
] as const;

export function presetFor(category: SectionCategory): SectionPreset {
  const fallback: SectionPreset = {
    category: "custom",
    label: "Sezione personalizzata",
    hint: "Titolo libero",
    token: "cat-custom",
  };
  return SECTION_PRESETS.find((p) => p.category === category) ?? fallback;
}

export const TEXTS = {
  emptyArchiveTitle: "Nessuna patch, per ora",
  emptyArchiveBody:
    "Quando avrai voglia di raccontare la tua settimana, crea la prima patch: bastano un titolo, una versione e un elemento.",
  deleteConfirm: "Vuoi eliminare questa patch? L'operazione non è reversibile.",
  unsavedConfirm: "Hai modifiche non salvate. Vuoi uscire comunque?",
} as const;
