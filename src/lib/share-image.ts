/**
 * Esportazione della scheda patch in PNG.
 * Unico punto dell'app che tocca il DOM per la cattura immagine e la
 * condivisione: compatibile con una futura integrazione Capacitor
 * (basta sostituire `downloadBlob`/`shareBlob`).
 */
import { toBlob } from "html-to-image";

export const EXPORT_WIDTH = 420;
export const EXPORT_SCALE = 2;

export type ShareOutcome = "shared" | "downloaded" | "cancelled";

export function safeFileName(version: string, fallback = "patch"): string {
  const base = (version || fallback)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `patchme-${base || fallback}.png`;
}

async function waitForFonts(): Promise<void> {
  try {
    if (typeof document !== "undefined" && "fonts" in document) {
      await document.fonts.ready;
    }
  } catch {
    /* non bloccante */
  }
}

export async function renderNodeToPng(node: HTMLElement): Promise<Blob> {
  await waitForFonts();
  const computed = window.getComputedStyle(node);
  const backgroundColor =
    computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? computed.backgroundColor
      : window.getComputedStyle(document.body).backgroundColor;

  const blob = await toBlob(node, {
    pixelRatio: EXPORT_SCALE,
    backgroundColor,
    cacheBust: true,
    width: node.offsetWidth,
    height: node.offsetHeight,
  });
  if (!blob) throw new Error("Immagine non generata");
  return blob;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export async function shareBlob(blob: Blob, fileName: string, title: string): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: "image/png" });
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const canShareFiles = Boolean(nav?.canShare?.({ files: [file] }) && nav.share);

  if (canShareFiles && nav) {
    try {
      await nav.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (isAbortError(error)) return "cancelled";
      downloadBlob(blob, fileName);
      return "downloaded";
    }
  }

  downloadBlob(blob, fileName);
  return "downloaded";
}
