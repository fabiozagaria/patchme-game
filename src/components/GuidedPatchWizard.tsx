import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUESTIONS = [
  { category: "news", title: "Novità", question: "Cosa hai iniziato?" },
  { category: "improvements", title: "Miglioramenti", question: "In cosa sei migliorato?" },
  { category: "fixes", title: "Correzioni", question: "Quale problema hai risolto?" },
  { category: "known", title: "Bug conosciuti", question: "Quale bug è ancora presente?" },
  {
    category: "next",
    title: "Prossimo aggiornamento",
    question: "Cosa vuoi aggiungere nella prossima versione?",
  },
] as const;

export interface GuidedAnswer {
  category: (typeof QUESTIONS)[number]["category"];
  title: string;
  text: string;
}

export function GuidedPatchWizard({
  onCancel,
  onComplete,
}: {
  onCancel: () => void;
  onComplete: (answers: GuidedAnswer[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => QUESTIONS.map(() => ""));
  const current = QUESTIONS[step];
  const finish = () =>
    onComplete(
      QUESTIONS.map((question, index) => ({ ...question, text: answers[index].trim() })).filter(
        (answer) => answer.text,
      ),
    );

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background px-4 py-8">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Creazione guidata</span>
          <button className="tap-safe px-2" onClick={onCancel}>
            Esci
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm font-semibold text-brand">
            Domanda {step + 1} di {QUESTIONS.length}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-foreground">{current.question}</h1>
          <Textarea
            autoFocus
            value={answers[step]}
            onChange={(event) =>
              setAnswers((values) =>
                values.map((value, index) => (index === step ? event.target.value : value)),
              )
            }
            placeholder="Scrivi quello che ti viene in mente"
            className="mt-6 min-h-32"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Puoi saltare la domanda e modificare tutto nell'editor.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
            className="tap-safe h-12"
          >
            Indietro
          </Button>
          <Button
            onClick={() =>
              step === QUESTIONS.length - 1 ? finish() : setStep((value) => value + 1)
            }
            className="tap-safe h-12 bg-brand text-brand-foreground"
          >
            {step === QUESTIONS.length - 1
              ? "Apri editor"
              : answers[step].trim()
                ? "Avanti"
                : "Salta"}
          </Button>
        </div>
      </main>
    </div>
  );
}
