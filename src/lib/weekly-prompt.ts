import { z } from "zod";
import { APP_CONFIG, type SectionCategory } from "@/config/app-config";

export interface WeeklyPrompt {
  question: string;
  hint: string;
  category: SectionCategory;
  sectionTitle: string;
}

export interface WeeklyPromptSelection extends WeeklyPrompt {
  answer: string;
  weekKey: string;
  weekLabel: string;
}

const WEEKLY_PROMPTS: readonly WeeklyPrompt[] = [
  {
    question: "Quale abilità hai sbloccato ultimamente?",
    hint: "Anche una cosa piccola conta.",
    category: "news",
    sectionTitle: "Abilità sbloccata",
  },
  {
    question: "Quale bug della tua vita vorresti correggere?",
    hint: "Una piccola abitudine o un problema ricorrente.",
    category: "known",
    sectionTitle: "Bug da correggere",
  },
  {
    question: "Qual è stato il tuo miglior aggiornamento recente?",
    hint: "Qualcosa che oggi funziona meglio di prima.",
    category: "improvements",
    sectionTitle: "Miglioramento",
  },
  {
    question: "Che cosa hai finalmente sistemato?",
    hint: "Un problema chiuso, grande o piccolo.",
    category: "fixes",
    sectionTitle: "Hotfix completato",
  },
  {
    question: "Quale funzione vorresti rimuovere dalla tua settimana?",
    hint: "Un impegno, un pensiero o una cattiva abitudine.",
    category: "removed",
    sectionTitle: "Funzione rimossa",
  },
  {
    question: "Cosa vuoi aggiungere nel prossimo aggiornamento?",
    hint: "Il prossimo passo che vuoi davvero fare.",
    category: "next",
    sectionTitle: "Prossimo aggiornamento",
  },
  {
    question: "Quale sorpresa ti ha regalato questa settimana?",
    hint: "Una cosa inattesa che vuoi ricordare.",
    category: "news",
    sectionTitle: "Evento a sorpresa",
  },
  {
    question: "Cosa ti ha dato più energia?",
    hint: "Una persona, un momento o un'attività.",
    category: "improvements",
    sectionTitle: "Bonus energia",
  },
  {
    question: "Quale boss hai affrontato ultimamente?",
    hint: "Una difficoltà che hai provato a superare.",
    category: "fixes",
    sectionTitle: "Boss affrontato",
  },
  {
    question: "Chi è stato l'NPC più importante della settimana?",
    hint: "Qualcuno che ha reso migliore la tua storia.",
    category: "custom",
    sectionTitle: "Personaggio della settimana",
  },
  {
    question: "Qual è il cambiamento di cui vai più fiero?",
    hint: "Non deve essere perfetto per essere importante.",
    category: "improvements",
    sectionTitle: "Miglior cambiamento",
  },
  {
    question: "Che messaggio lasceresti nelle note dello sviluppatore?",
    hint: "Una frase sincera sulla tua settimana.",
    category: "custom",
    sectionTitle: "Nota dello sviluppatore",
  },
];

export const weeklyPromptSelectionSchema = z.object({
  question: z.string().min(1),
  hint: z.string().min(1),
  category: z.enum(["news", "improvements", "fixes", "known", "removed", "next", "custom"]),
  sectionTitle: z.string().min(1).max(APP_CONFIG.limits.sectionTitle),
  answer: z.string().trim().min(1).max(APP_CONFIG.limits.itemText),
  weekKey: z.string().min(1),
  weekLabel: z.string().min(1),
});

function isoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return {
    year: target.getUTCFullYear(),
    week: Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
  };
}

export function getWeeklyPrompt(date = new Date()) {
  const { year, week } = isoWeek(date);
  const prompt = WEEKLY_PROMPTS[(year * 53 + week) % WEEKLY_PROMPTS.length];
  return {
    ...prompt,
    weekKey: `${year}-W${String(week).padStart(2, "0")}`,
    weekLabel: `Settimana ${week}`,
  };
}
