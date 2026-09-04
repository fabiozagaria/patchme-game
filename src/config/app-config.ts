/**
 * Configurazione centrale di PatchMe.
 * Tutto ciò che riguarda marchio, firma, testi e categorie vive qui,
 * così l'app può essere personalizzata senza toccare la logica.
 */

export const APP_CONFIG = {
  name: "PatchMe",
  tagline: "Trasforma persone e momenti in patch notes",
  // Incrementare a ogni aggiornamento visibile: attiva automaticamente il popup Novità.
  version: "0.6.0",
  releaseChannel: "Alpha",
  changelog: {
    date: "4 settembre 2026",
    title: "PatchMe ora suona e segue un flusso più coerente.",
    items: [
      "Profilo giocatore locale con livello e titolo",
      "XP guadagnati pubblicando patch e aggiungendo contenuti",
      "Animazioni e notifiche quando guadagni XP o sali di livello",
      "Titoli sarcastici con riferimenti impliciti ai videogiochi leggendari",
      "Missioni, trofei e ricompense XP da collezionare",
      "Missioni giornaliere e settimanali che si rinnovano",
      "Animazione speciale quando inizi o continui una serie",
      "66 easter egg dedicati ai videogiochi leggendari e alle saghe più amate",
      "Raccolta missioni spostata in una pagina dedicata",
      "Almeno 3 caratteri richiesti per ogni voce pubblicata",
      "Ritorno automatico all'archivio dopo creazione o condivisione",
      "Popup Novità più compatto e chiudibile anche sugli schermi piccoli",
      "Prima configurazione con anteprima immediata di tema, colore e avatar",
      "Ritorno alla home dopo il salvataggio delle impostazioni",
      "Focus e scorrimento automatici sul primo errore di validazione",
      "Notifiche XP corrette per missioni ed easter egg",
      "Effetti sonori retro per salvataggi, XP, trofei, serie e level-up",
      "Le serie conquistate non si azzerano eliminando le patch",
      "Condivisione disponibile soltanto dopo la pubblicazione",
      "Condivisione rapida delle patch pubblicate direttamente dall'archivio",
      "Nome utente da 3 caratteri e massimo 5 modifiche al giorno",
      "Nuovi colori e avatar di Patchy personalizzabili",
      "Anteprima immediata di tema, colore e avatar prima del salvataggio",
      "Notifiche mostrate in coda per 5 secondi completi ciascuna",
      "Serie calcolata sulle settimane consecutive",
      "Statistiche per patch pubblicate e voci create",
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
