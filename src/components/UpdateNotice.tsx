import { APP_CONFIG } from "@/config/app-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Check } from "lucide-react";
import { PatchyMascot } from "@/components/PatchyMascot";
import { Link } from "@tanstack/react-router";

export function UpdateNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] max-w-sm flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-h-[90dvh]">
        <DialogHeader className="shrink-0 border-b border-border px-4 pb-3 pt-4 pr-12 text-left">
          <div className="flex items-center gap-3">
            <PatchyMascot
              className="size-14 shrink-0 object-contain sm:size-16"
              pose="celebrate"
              decorative
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>Novità in PatchMe</DialogTitle>
                <Badge variant="secondary">
                  v{APP_CONFIG.version} {APP_CONFIG.releaseChannel}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{APP_CONFIG.changelog.date}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <p className="text-sm font-medium text-foreground">{APP_CONFIG.changelog.title}</p>
          <ul className="mt-3 space-y-2 rounded-xl bg-surface-2 p-3 text-sm text-foreground">
            {APP_CONFIG.changelog.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid shrink-0 gap-2 border-t border-border bg-background px-4 py-3">
          <Button asChild variant="outline" className="tap-safe">
            <Link to="/notifications" onClick={onClose}>
              <Bell className="mr-2 size-4" aria-hidden="true" />
              Apri il centro notifiche
            </Link>
          </Button>
          <Button onClick={onClose} className="tap-safe bg-brand text-brand-foreground">
            Ho capito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
