import { useState } from "react";
import { ArrowLeft, ArrowRight, Gamepad2, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatchyMascot, type PatchyPose } from "@/components/PatchyMascot";

const STEPS = [
  {
    icon: Gamepad2,
    pose: "hello",
    title: "Trasforma amici e situazioni in finte patch notes",
    body: "Scrivi cosa è cambiato, crea un'immagine e condividila per farvi due risate.",
    example:
      "Andrea v2.1 · Migliorata la puntualità del 4% · Bug noto: dice “sto arrivando” mentre è ancora a casa.",
  },
  {
    icon: Share2,
    pose: "thinking",
    title: "Come funziona?",
    body: "Scegli chi o cosa vuoi patchare, aggiungi novità, miglioramenti e bug, poi scegli uno stile.",
    example:
      "Non sai cosa scrivere? Usa la creazione guidata o uno dei suggerimenti rapidi dell'editor.",
  },
  {
    icon: ShieldCheck,
    pose: "celebrate",
    title: "Condividila con chi vuoi",
    body: "Salva la patch come immagine o inviala su WhatsApp. Non serve un account e resta sul tuo dispositivo.",
    example:
      "Attenzione: se cancelli i dati del sito o cambi dispositivo, potresti perdere le patch salvate.",
  },
] as const satisfies readonly {
  icon: typeof Gamepad2;
  pose: PatchyPose;
  title: string;
  body: string;
  example: string;
}[];

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
        Salta tutorial
      </button>
      <section
        key={current.title}
        aria-live="polite"
        aria-labelledby="tour-title"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="relative mb-5">
          <PatchyMascot
            className="size-36 object-contain drop-shadow-[0_12px_30px_rgba(183,255,60,0.16)]"
            pose={current.pose}
          />
          <span className="absolute bottom-1 right-1 flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-background text-brand shadow-lg">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        <p className="display text-xs font-extrabold uppercase tracking-[0.3em] text-brand">
          PatchMe
        </p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Passaggio {step + 1} di {STEPS.length}
        </p>
        <h1 id="tour-title" className="mt-3 text-2xl font-extrabold leading-tight text-foreground">
          {current.title}
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
          {current.body}
        </p>
        <div className="mt-5 max-w-sm rounded-xl border border-brand/25 bg-brand/5 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Esempio semplice</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{current.example}</p>
        </div>
        <div className="mt-7 flex gap-2" aria-hidden="true">
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-brand" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      </section>
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
          {step === STEPS.length - 1 ? "Configura e inizia" : "Avanti"}{" "}
          {step < STEPS.length - 1 && <ArrowRight className="ml-1 size-4" />}
        </Button>
      </div>
    </main>
  );
}
