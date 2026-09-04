import { useState } from "react";
import { Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { APP_CONFIG } from "@/config/app-config";
import { getWeeklyPrompt, type WeeklyPromptSelection } from "@/lib/weekly-prompt";
import { PatchyMascot } from "@/components/PatchyMascot";
import { Button } from "@/components/ui/button";
import { hardcoreCopy } from "@/lib/hardcore-copy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WeeklyPromptCardProps {
  onCreatePatch: (selection: WeeklyPromptSelection) => void;
  hardcoreMode?: boolean;
}

export function WeeklyPromptCard({ onCreatePatch, hardcoreMode = false }: WeeklyPromptCardProps) {
  const [prompt] = useState(() => getWeeklyPrompt());
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const cleanAnswer = answer.trim();

  const sharePrompt = async () => {
    const text = `🎮 La domanda settimanale di Patchy:\n\n${prompt.question}\n\nRispondi anche tu su PatchMe: ${window.location.origin}`;
    try {
      if (navigator.share) await navigator.share({ title: "La domanda di Patchy", text });
      else {
        await navigator.clipboard.writeText(text);
        enqueueSuccessNotification("Domanda copiata: ora inviala a chi vuoi", {
          sound: "success",
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Condivisione non riuscita");
    }
  };

  return (
    <section className="surface-card overflow-hidden p-4" aria-labelledby="weekly-prompt-title">
      <div className="flex items-start gap-3">
        <PatchyMascot className="size-24 shrink-0 object-contain" pose="thinking" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            {hardcoreCopy(hardcoreMode, "Domanda settimanale", "Interrogatorio settimanale")}
          </p>
          <h2 id="weekly-prompt-title" className="mt-1 text-lg font-bold text-foreground">
            {prompt.question}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{prompt.hint}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          onClick={() => setOpen(true)}
          className="tap-safe bg-brand font-bold text-brand-foreground hover:bg-brand/90"
        >
          <Sparkles className="mr-1 size-4" />{" "}
          {hardcoreCopy(hardcoreMode, "Rispondi e crea una patch", "Rispondi, se ne sei capace")}
        </Button>
        <Button variant="outline" onClick={sharePrompt} className="tap-safe">
          <Share2 className="mr-1 size-4" />{" "}
          {hardcoreCopy(hardcoreMode, "Sfida un amico", "Trascina un amico nel disagio")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{prompt.question}</DialogTitle>
            <DialogDescription>
              {prompt.hint} La risposta diventerà la prima voce della tua nuova patch.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="weekly-answer" className="text-sm font-semibold text-foreground">
              {hardcoreCopy(hardcoreMode, "La tua risposta", "La tua brillante cazzata")}
            </label>
            <textarea
              id="weekly-answer"
              autoFocus
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              maxLength={APP_CONFIG.limits.itemText}
              rows={5}
              placeholder="Scrivi qui, senza pensarci troppo…"
              className="mt-2 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {answer.length}/{APP_CONFIG.limits.itemText}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {hardcoreCopy(hardcoreMode, "Annulla", "Lascia perdere")}
            </Button>
            <Button
              disabled={!cleanAnswer}
              onClick={() => onCreatePatch({ ...prompt, answer: cleanAnswer })}
              className="bg-brand font-bold text-brand-foreground hover:bg-brand/90"
            >
              {hardcoreCopy(hardcoreMode, "Crea la patch", "Crea 'sta roba")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
