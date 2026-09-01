import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/config/app-config";

let introAlreadyShown = false;

/**
 * Firma di apertura: tre righe compatte, animazione d'impatto originale.
 * Compare solo al caricamento iniziale, mai durante la navigazione.
 */
export function IntroSignature({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const duration = APP_CONFIG.signature.durationMs;
    const out = window.setTimeout(() => setLeaving(true), duration);
    const done = window.setTimeout(() => {
      introAlreadyShown = true;
      onDone();
    }, duration + 320);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="intro-sweep" />
      <div className="flex flex-col items-center leading-[0.82]">
        {APP_CONFIG.signature.lines.map((line, index) => (
          <span
            key={line}
            className="intro-line text-5xl font-black uppercase tracking-[-0.04em] text-foreground sm:text-6xl"
            style={{ animationDelay: `${index * 110}ms` }}
          >
            {line}
          </span>
        ))}
        <span className="intro-rule mt-4 block h-[3px] w-24 rounded-full bg-brand" />
      </div>
    </div>
  );
}

export function shouldShowIntro(): boolean {
  return APP_CONFIG.signature.enabled && !introAlreadyShown;
}
