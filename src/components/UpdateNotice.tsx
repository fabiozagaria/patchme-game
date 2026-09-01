import { APP_CONFIG } from "@/config/app-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Send, Sparkles } from "lucide-react";
import { PatchyMascot } from "@/components/PatchyMascot";

export function UpdateNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex items-end gap-2">
            <PatchyMascot className="size-24 object-contain" decorative />
            <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>Novità in PatchMe</DialogTitle>
            <Badge variant="secondary">
              v{APP_CONFIG.version} {APP_CONFIG.releaseChannel}
            </Badge>
          </div>
        </DialogHeader>
        <div>
          <p className="text-sm font-medium text-foreground">{APP_CONFIG.changelog.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{APP_CONFIG.changelog.date}</p>
        </div>
        <ul className="space-y-3 rounded-xl bg-surface-2 p-4 text-sm text-foreground">
          {APP_CONFIG.changelog.items.map((item) => (
            <li key={item} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="grid gap-2">
          <Button asChild variant="outline" className="tap-safe">
            <a href={APP_CONFIG.links.telegram} target="_blank" rel="noreferrer">
              <Send className="mr-2 size-4" aria-hidden="true" />
              Segui gli aggiornamenti
            </a>
          </Button>
          <Button onClick={onClose} className="tap-safe bg-brand text-brand-foreground">
            Ho capito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
