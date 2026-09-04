import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import {
  copyShareText,
  downloadBlob,
  renderNodeToPng,
  safeFileName,
  shareBlob,
} from "@/lib/share-image";

interface ExportTarget {
  version: string;
  title: string;
  shareText?: string;
}

/**
 * Hook dedicato all'esportazione della scheda patch.
 * Espone il ref da collegare al nodo da catturare e due azioni protette
 * contro i doppi tocchi.
 */
export function useCardExport(target: ExportTarget) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState<"save" | "share" | "copy" | null>(null);

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
      enqueueSuccessNotification("Immagine salvata", { sound: "success" });
    } catch {
      toast.error("Non è stato possibile generare l'immagine");
    } finally {
      setBusy(null);
    }
  }, [busy, capture, fileName]);

  const shareImage = useCallback(async () => {
    if (busy) return false;
    setBusy("share");
    try {
      const blob = await capture();
      const outcome = await shareBlob(blob, fileName, target.title, target.shareText ?? "");
      if (outcome === "cancelled") return false;
      if (outcome === "shared")
        enqueueSuccessNotification("Condivisione completata", { sound: "success" });
      else if (outcome === "downloaded-and-copied")
        enqueueSuccessNotification("Immagine scaricata e messaggio copiato", {
          sound: "success",
        });
      else if (outcome === "downloaded")
        enqueueSuccessNotification("Condivisione non disponibile: immagine scaricata", {
          sound: "success",
        });
      return true;
    } catch {
      toast.error("Non è stato possibile condividere l'immagine");
      return false;
    } finally {
      setBusy(null);
    }
  }, [busy, capture, fileName, target.shareText, target.title]);

  const copyCaption = useCallback(async () => {
    if (busy) return false;
    setBusy("copy");
    try {
      const copied = await copyShareText(target.shareText ?? "");
      if (copied) enqueueSuccessNotification("Didascalia copiata", { sound: "success" });
      else toast.error("Il browser non consente di copiare la didascalia");
      return copied;
    } finally {
      setBusy(null);
    }
  }, [busy, target.shareText]);

  return { nodeRef, busy, saveImage, shareImage, copyCaption };
}
