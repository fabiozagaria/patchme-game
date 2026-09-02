import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  ListChecks,
  PlusCircle,
  Save,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatchyMascot, type PatchyPose } from "@/components/PatchyMascot";

const STEPS = [
  {
    icon: Gamepad2,
    pose: "hello",
    title: "A cosa serve PatchMe?",
    body: "Serve a raccontare la tua settimana come se fosse l'aggiornamento di un videogioco.",
    example: "Hai iniziato palestra? Puoi scrivere: “Nuova funzione: palestra sbloccata”.",
  },
  {
    icon: PlusCircle,
    pose: "thinking",
    title: "Crea una nuova patch",
    body: "Dalla schermata principale premi “Nuova patch”. Puoi rispondere a cinque domande oppure compilare tutto da solo.",
    example: "Se è la prima volta, scegli “Creazione guidata”: è la strada più semplice.",
  },
  {
    icon: ListChecks,
    pose: "thinking",
    title: "Scrivi cosa è cambiato",
    body: "Dividi la settimana in sezioni. Non devi usare parole perfette: scrivi semplicemente cosa è successo.",
    example: "Novità: palestra. Miglioramento: dormo meglio. Bug: rimando ancora la sveglia.",
  },
  {
    icon: Save,
    pose: "celebrate",
    title: "Salva oppure pubblica",
    body: "Salva come bozza se vuoi finirla dopo. Premi “Pubblica” quando la patch è pronta.",
    example: "Pubblicare non la mette online: la patch resta ancora soltanto sul tuo dispositivo.",
  },
  {
    icon: Share2,
    pose: "celebrate",
    title: "Personalizza e condividi",
    body: "Apri la patch, scegli uno stile e controlla l'anteprima. Poi salvala come immagine oppure condividila.",
    example: "Su WhatsApp vengono inviati l'immagine, un breve messaggio e il link a PatchMe.",
  },
  {
    icon: ShieldCheck,
    pose: "bug",
    title: "Dove vengono salvati i dati?",
    body: "Non serve un account. Per ora le patch vengono salvate soltanto nel browser che stai usando.",
    example: "Se cancelli i dati del sito o cambi dispositivo, potresti perdere le patch.",
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
          {step === STEPS.length - 1 ? "Ho capito" : "Avanti"}{" "}
          {step < STEPS.length - 1 && <ArrowRight className="ml-1 size-4" />}
        </Button>
      </div>
    </main>
  );
}
