import { useEffect } from "react";
import { Gift, Sparkles } from "lucide-react";
import { playGameSound } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BitCoin } from "@/components/BitCoin";

const PARTICLES = Array.from({ length: 12 }, (_, index) => index);

export function WelcomeGift({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) playGameSound("trophy");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="welcome-gift-dialog max-w-[calc(100%-1rem)] overflow-hidden rounded-3xl border-brand/40 p-0 sm:max-w-sm">
        <div className="welcome-gift-stage relative isolate overflow-hidden px-5 pb-5 pt-8 text-center">
          <div className="welcome-gift-aura absolute left-1/2 top-20 -z-10 size-56 -translate-x-1/2 rounded-full" />
          {PARTICLES.map((particle) => (
            <span
              key={particle}
              aria-hidden="true"
              className="welcome-gift-particle absolute left-1/2 top-28 size-2 rounded-full bg-brand"
              style={{ "--particle": particle } as React.CSSProperties}
            />
          ))}

          <div className="welcome-gift-coin mx-auto" aria-hidden="true">
            <BitCoin className="welcome-gift-coin-face" />
          </div>

          <DialogHeader className="mt-5 items-center text-center sm:text-center">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-brand">
              <Gift className="size-4" /> Regalo di benvenuto <Sparkles className="size-4" />
            </div>
            <DialogTitle className="display text-4xl font-black uppercase leading-none">
              Hai ricevuto 44 Bit
            </DialogTitle>
            <DialogDescription className="max-w-xs text-sm leading-relaxed">
              Sono già nel tuo portafoglio. Usali nel Patchy Shop per sbloccare cosmetici e rendere
              il profilo ancora più discutibile.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-2xl border border-brand/20 bg-black/10 px-4 py-3 text-xs text-muted-foreground">
            I 44 Bit vengono assegnati automaticamente, una sola volta, a ogni profilo locale già
            esistente o appena creato.
          </div>

          <Button
            onClick={onClose}
            className="tap-safe mt-5 h-12 w-full bg-brand text-base font-black text-brand-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--brand)_35%,transparent)] hover:bg-brand/90"
          >
            <BitCoin className="size-5" /> Incassa il bottino
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
