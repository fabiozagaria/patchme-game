import { forwardRef } from "react";
import { APP_CONFIG, presetFor } from "@/config/app-config";
import { cleanPatch, type Patch } from "@/lib/patch-model";
import { formatDate } from "@/lib/versioning";

interface PatchPreviewCardProps {
  patch: Patch;
  displayName: string;
}

/**
 * Scheda condivisibile. Il ref sul nodo radice è già predisposto per una
 * futura esportazione immagine (nessuna dipendenza aggiuntiva per ora).
 */
export const PatchPreviewCard = forwardRef<HTMLDivElement, PatchPreviewCardProps>(
  function PatchPreviewCard({ patch, displayName }, ref) {
    const clean = cleanPatch(patch);

    return (
      <div
        ref={ref}
        data-patchme-share-card
        className="surface-card overflow-hidden bg-surface p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {displayName || "Patch personali"}
            </p>
            <h2 className="display mt-1 text-2xl font-extrabold uppercase leading-tight text-foreground">
              {clean.title || "Senza titolo"}
            </h2>
          </div>
          <span className="shrink-0 rounded-md bg-brand px-2 py-1 text-sm font-bold text-brand-foreground">
            {clean.version || "—"}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">{formatDate(clean.date)}</p>

        <div className="mt-5 space-y-5">
          {clean.sections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessuna sezione compilata: aggiungi almeno un elemento.
            </p>
          )}
          {clean.sections.map((section) => {
            const preset = presetFor(section.category);
            return (
              <section key={section.id}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ backgroundColor: `var(--${preset.token})` }}
                  />
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: `var(--${preset.token})` }}
                  >
                    {section.title || preset.label}
                  </h3>
                </div>
                <ul className="mt-2 space-y-1.5 border-l border-border pl-4">
                  {section.items.map((item) => (
                    <li key={item.id} className="text-sm leading-relaxed text-foreground">
                      {item.text}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-3">
          <span className="display text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
            {APP_CONFIG.name}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {clean.status === "published" ? "Pubblicata" : "Bozza"}
          </span>
        </div>
      </div>
    );
  },
);
