import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  downloadBlob,
  renderNodeToPng,
  safeFileName,
  shareBlob,
} from "@/lib/share-image";

interface ExportTarget {
  version: string;
  title: string;
}

/**
 * Hook dedicato all'esportazione della scheda patch.
 * Espone il ref da collegare al nodo da catturare e due azioni protette
 * contro i doppi tocchi.
 */
export function useCardExport(target: ExportTarget) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);

  const capture = useCallback(async (): Promise<Blob> => {
    const node = nodeRef.current;
    if (!node) throw new Error("Scheda non disponibile");
    return renderNodeToPng(node);
  }, []);

  const fileName = safeFileName(target.version);

  const saveImage = useCallback(async () => {
    if (busy) return;
    setBusy("save");
    try {
      const blob = await capture();
      downloadBlob(blob, fileName);
      toast.success("Immagine salvata");
    } catch {
      toast.error("Non è stato possibile generare l'immagine");
    } finally {
      setBusy(null);
    }
  }, [busy, capture, fileName]);

  const shareImage = useCallback(async () => {
    if (busy) return;
    setBusy("share");
    try {
      const blob = await capture();
      const outcome = await shareBlob(blob, fileName, target.title);
      if (outcome === "shared") toast.success("Condivisione avviata");
      else if (outcome === "downloaded")
        toast.success("Condivisione non disponibile: immagine scaricata");
    } catch {
      toast.error("Non è stato possibile condividere l'immagine");
    } finally {
      setBusy(null);
    }
  }, [busy, capture, fileName, target.title]);

  return { nodeRef, busy, saveImage, shareImage };
}
