import { useState } from "react";
import { ArrowLeft, ArrowRight, Gamepad2, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Gamepad2,
    title: "Sei una versione in aggiornamento",
    body: "Trasforma quello che cambia nella tua settimana in patch notes personali.",
  },
  {
    icon: Sparkles,
    title: "Registra l'aggiornamento",
    body: "Novità, miglioramenti, correzioni, bug ancora aperti e ciò che vuoi aggiungere dopo.",
  },
  {
    icon: Share2,
    title: "Salva e condividi",
    body: "Pubblica la patch, trasformala in un'immagine e scegli cosa mostrare agli altri.",
  },
] as const;

export function ProductTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-8 pt-10">
      <button
        type="button"
        onClick={onDone}
        className="tap-safe self-end px-3 text-sm text-muted-foreground"
      >
        Salta
      </button>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-7 flex size-20 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <Icon className="size-10" aria-hidden="true" />
        </div>
        <p className="display text-xs font-extrabold uppercase tracking-[0.3em] text-brand">
          PatchMe
        </p>
        <h1 className="mt-3 text-3xl font-extrabold uppercase leading-tight text-foreground">
          {current.title}
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
          {current.body}
        </p>
        <div className="mt-8 flex gap-2" aria-label={`Passaggio ${step + 1} di ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-brand" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((value) => value - 1)}
          className="tap-safe h-12"
        >
          <ArrowLeft className="mr-1 size-4" /> Indietro
        </Button>
        <Button
          onClick={() => (step === STEPS.length - 1 ? onDone() : setStep((value) => value + 1))}
          className="tap-safe h-12 bg-brand font-semibold text-brand-foreground"
        >
          {step === STEPS.length - 1 ? "Inizia" : "Avanti"}{" "}
          {step < STEPS.length - 1 && <ArrowRight className="ml-1 size-4" />}
        </Button>
      </div>
    </main>
  );
}
