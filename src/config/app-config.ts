/**
 * Configurazione centrale di PatchMe.
 * Tutto ciò che riguarda marchio, firma, testi e categorie vive qui,
 * così l'app può essere personalizzata senza toccare la logica.
 */

export const APP_CONFIG = {
  name: "PatchMe",
  tagline: "Trasforma le storie del gruppo in patch notes",
  // Incrementare a ogni aggiornamento visibile: attiva automaticamente il popup Novità.
  version: "1.0.0",
  releaseChannel: "Stabile",
  changelog: {
    date: "11 settembre 2026",
    title: "PatchMe esce dall'Alpha: tutto resta locale, pronto da usare e da condividere.",
    items: [
      "Stabilizzati creazione, modifica, pubblicazione e condivisione delle patch",
      "Progressione, Bit, Shop, missioni e notifiche restano salvati nel browser",
      "Controlli di validazione e recupero sicuro da dati locali non validi",
      "Interfaccia mobile-first, PWA e temi pronti per l'uso quotidiano",
      "Nessun backend, account o sincronizzazione: i dati restano sul dispositivo",
    ],
  },
  links: {
    github: "https://github.com/fabiozagaria/patchme-game",
    portfolio: "https://fabio-zagaria-portfolio.vercel.app",
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
    patchTarget: 50,
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
