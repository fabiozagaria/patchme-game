import { APP_CONFIG } from "@/config/app-config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function UpdateNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novità in PatchMe · v{APP_CONFIG.version}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{APP_CONFIG.changelog.title}</p>
        <ul className="space-y-2 border-l border-brand/40 pl-4 text-sm text-foreground">
          {APP_CONFIG.changelog.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button onClick={onClose} className="tap-safe bg-brand text-brand-foreground">
          Ho capito
        </Button>
      </DialogContent>
    </Dialog>
  );
}
