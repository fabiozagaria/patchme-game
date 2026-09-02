import { forwardRef } from "react";
import { APP_CONFIG, presetFor } from "@/config/app-config";
import { cleanPatch, type Patch, type ShareTemplate } from "@/lib/patch-model";
import { formatDate } from "@/lib/versioning";
import { PatchyMascot, type PatchyPose } from "@/components/PatchyMascot";

interface PatchPreviewCardProps {
  patch: Patch;
  displayName: string;
  sharing?: boolean;
  template?: ShareTemplate;
}

const TEMPLATE_STYLES: Record<
  ShareTemplate,
  {
    card: string;
    label: string;
    title: string;
    body: string;
    border: string;
    badge: string;
    pose: PatchyPose;
  }
> = {
  classic: {
    card: "bg-surface",
    label: "text-muted-foreground",
    title: "text-foreground",
    body: "text-foreground",
    border: "border-border",
    badge: "bg-brand text-brand-foreground",
    pose: "celebrate",
  },
  terminal: {
    card: "border-emerald-500/40 bg-[#07120d] font-mono shadow-[inset_0_0_32px_rgba(16,185,129,0.08)]",
    label: "text-emerald-400/70",
    title: "text-emerald-300",
    body: "text-emerald-50",
    border: "border-emerald-500/30",
    badge: "bg-emerald-400 text-emerald-950",
    pose: "thinking",
  },
  rpg: {
    card: "border-amber-700/50 bg-[#21170d] shadow-[inset_0_0_40px_rgba(217,119,6,0.10)]",
    label: "text-amber-300/70",
    title: "font-serif text-amber-100",
    body: "text-amber-50",
    border: "border-amber-700/40",
    badge: "bg-amber-600 text-amber-50",
    pose: "hello",
  },
  chaos: {
    card: "border-fuchsia-500/50 bg-[#1c0c23] shadow-[inset_0_0_40px_rgba(217,70,239,0.12)]",
    label: "text-cyan-300/80",
    title: "-rotate-1 text-fuchsia-200",
    body: "text-fuchsia-50",
    border: "border-fuchsia-500/30",
    badge: "rotate-2 bg-cyan-300 text-slate-950",
    pose: "bug",
  },
};

/**
 * Scheda condivisibile. Il ref sul nodo radice è già predisposto per una
 * futura esportazione immagine (nessuna dipendenza aggiuntiva per ora).
 */
export const PatchPreviewCard = forwardRef<HTMLDivElement, PatchPreviewCardProps>(
  function PatchPreviewCard({ patch, displayName, sharing = false, template = "classic" }, ref) {
    const clean = cleanPatch(patch);
    const style = TEMPLATE_STYLES[template];
    const visibleSections = sharing
      ? clean.sections.filter((section) => section.shareVisible)
      : clean.sections;

    return (
      <div
        ref={ref}
        data-patchme-share-card
        className={`surface-card overflow-hidden p-5 ${style.card}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-widest ${style.label}`}>
              {displayName || "Patch personali"}
            </p>
            <h2
              className={`display mt-1 text-2xl font-extrabold uppercase leading-tight ${style.title}`}
            >
              {clean.title || "Senza titolo"}
            </h2>
          </div>
          <span className={`shrink-0 rounded-md px-2 py-1 text-sm font-bold ${style.badge}`}>
            {clean.version || "—"}
          </span>
        </div>

        <p className={`mt-1 text-xs ${style.label}`}>{formatDate(clean.date)}</p>

        <div className="mt-5 space-y-5">
          {visibleSections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessuna sezione compilata: aggiungi almeno un elemento.
            </p>
          )}
          {visibleSections.map((section) => {
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
                    <li key={item.id} className={`text-sm leading-relaxed ${style.body}`}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className={`mt-6 flex items-end justify-between border-t pt-3 ${style.border}`}>
          <div className="flex items-center gap-2">
            <PatchyMascot className="size-12 object-contain" pose={style.pose} decorative />
            <span className="display text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
              {APP_CONFIG.name}
            </span>
          </div>
          <span className={`text-[11px] uppercase tracking-wide ${style.label}`}>
            {clean.status === "published" ? "Pubblicata" : "Bozza"}
          </span>
        </div>
      </div>
    );
  },
);
