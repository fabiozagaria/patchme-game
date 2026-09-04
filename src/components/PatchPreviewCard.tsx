import { forwardRef } from "react";
import { APP_CONFIG, presetFor } from "@/config/app-config";
import {
  cleanPatch,
  type Patch,
  type ProfileAvatar,
  type ShareOrientation,
  type ShareTemplate,
} from "@/lib/patch-model";
import { formatDate } from "@/lib/versioning";
import { PatchyMascot, type PatchyPose } from "@/components/PatchyMascot";
import { cosmeticById, profileEffectClass, profileFrameClass } from "@/lib/patchy-shop";
import { EXPORT_SIZES } from "@/lib/share-image";
import { patchSubjectLabel } from "@/lib/patch-sharing";

export interface SharedPlayerProfile {
  avatar: ProfileAvatar;
  equippedAvatarId: string | null;
  equippedFrameId: string | null;
  equippedEffectId: string | null;
  level: number;
  title: string;
  weeklyStreak: number;
  publishedPatches: number;
}

interface PatchPreviewCardProps {
  patch: Patch;
  displayName: string;
  sharing?: boolean;
  template?: ShareTemplate;
  orientation?: ShareOrientation;
  profile?: SharedPlayerProfile;
  exporting?: boolean;
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
  function PatchPreviewCard(
    {
      patch,
      displayName,
      sharing = false,
      template = "classic",
      orientation = "vertical",
      profile,
      exporting = false,
    },
    ref,
  ) {
    const clean = cleanPatch(patch);
    const style = TEMPLATE_STYLES[template];
    const size = EXPORT_SIZES[orientation];
    const previewRatio = size.width / size.height;
    const equippedAvatar = cosmeticById(profile?.equippedAvatarId ?? null);
    const visibleSections = sharing
      ? clean.sections.filter((section) => section.shareVisible)
      : clean.sections;
    const totalItems = visibleSections.reduce((total, section) => total + section.items.length, 0);
    const compact = orientation === "horizontal" || orientation === "square" || totalItems > 8;
    const previewWidth =
      orientation === "story"
        ? "max-w-[15rem]"
        : orientation === "horizontal"
          ? "max-w-full"
          : orientation === "square"
            ? "max-w-[22rem]"
            : "max-w-[20rem]";

    return (
      <div
        ref={ref}
        data-patchme-share-card
        data-orientation={orientation}
        style={
          exporting
            ? { width: size.width, height: size.height }
            : sharing
              ? {
                  aspectRatio: `${size.width} / ${size.height}`,
                  width: `min(100%, calc(min(54dvh, 34rem) * ${previewRatio}))`,
                }
              : undefined
        }
        className={`surface-card flex min-h-0 max-w-full overflow-hidden ${sharing && !exporting ? `social-preview-card mx-auto ${previewWidth}` : ""} ${compact ? "p-4" : "p-5"} ${orientation === "horizontal" ? "flex-row gap-5" : "flex-col"} ${style.card} ${profileFrameClass(profile?.equippedFrameId ?? null)} ${profileEffectClass(profile?.equippedEffectId ?? null)}`}
      >
        <div
          className={`flex min-w-0 flex-1 flex-col ${orientation === "horizontal" ? "basis-2/3" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs font-medium uppercase tracking-widest ${style.label}`}>
                Patch notes di @{displayName || "username"}
              </p>
              <h2
                className={`display mt-1 font-extrabold uppercase leading-tight ${compact ? "text-xl" : "text-2xl"} ${style.title}`}
              >
                {clean.title || "Senza titolo"}
              </h2>
            </div>
            <span className={`shrink-0 rounded-md px-2 py-1 text-sm font-bold ${style.badge}`}>
              {clean.version || "—"}
            </span>
          </div>

          <div
            className={`mt-2 flex flex-wrap items-center gap-1.5 ${compact ? "text-[0.62rem]" : "text-[0.68rem]"}`}
          >
            <span
              className={`rounded-full border px-2 py-0.5 font-bold ${style.border} ${style.body}`}
            >
              {patchSubjectLabel(clean.subject, clean.targetName)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-bold ${style.border} ${style.label}`}
            >
              Creata da @{displayName || "username"}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-black uppercase ${
                clean.tone === "hardcore"
                  ? "border-red-500/50 bg-red-500/15 text-red-300"
                  : clean.tone === "sarcastic"
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                    : `${style.border} ${style.label}`
              }`}
            >
              {clean.tone === "hardcore"
                ? "Hardcore"
                : clean.tone === "sarcastic"
                  ? "Bastardo"
                  : "Leggero"}
            </span>
          </div>

          <p className={`mt-1 text-xs ${style.label}`}>{formatDate(clean.date)}</p>

          <div
            className={`mt-4 min-h-0 flex-1 content-start gap-x-4 gap-y-3 overflow-hidden ${orientation === "horizontal" || totalItems > 10 ? "grid grid-cols-2" : "space-y-4"}`}
          >
            {visibleSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nessuna sezione compilata: aggiungi almeno un elemento.
              </p>
            ) : null}
            {visibleSections.map((section) => {
              const preset = presetFor(section.category);
              return (
                <section key={section.id} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--${preset.token})` }}
                    />
                    <h3
                      className={`${compact ? "text-xs" : "text-sm"} truncate font-semibold uppercase tracking-wide`}
                      style={{ color: `var(--${preset.token})` }}
                    >
                      {section.title || preset.label}
                    </h3>
                  </div>
                  <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
                    {section.items.map((item) => (
                      <li
                        key={item.id}
                        className={`${compact ? "text-xs leading-snug" : "text-sm leading-relaxed"} ${style.body}`}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className={`mt-3 flex items-end justify-between border-t pt-2 ${style.border}`}>
            <span className="display text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
              {APP_CONFIG.name}
            </span>
            <span className={`text-[10px] uppercase tracking-wide ${style.label}`}>
              {clean.status === "published" ? "Pubblicata" : "Bozza"}
            </span>
          </div>
          {sharing ? (
            <div className={`mt-2 text-center ${style.label}`}>
              <p
                className={`${compact ? "text-[0.62rem]" : "text-xs"} font-black uppercase tracking-[0.16em]`}
              >
                {clean.subject === "self"
                  ? "Patcha qualcuno prima che patchino te"
                  : "Sei stato patchato"}
              </p>
              <p className="mt-0.5 text-[0.58rem]">Apri PatchMe e rispondi con una contro-patch</p>
            </div>
          ) : null}
        </div>

        {profile ? (
          <aside
            className={`${orientation === "horizontal" ? "w-44 shrink-0 border-l pl-4" : "mt-3 border-t pt-3"} ${style.border}`}
            aria-label="Profilo giocatore"
          >
            <div
              className={`flex items-center ${orientation === "horizontal" ? "flex-col text-center" : "gap-3"}`}
            >
              <div className="relative shrink-0">
                {equippedAvatar?.imageSrc ? (
                  <img
                    src={equippedAvatar.imageSrc}
                    alt=""
                    className={`${orientation === "horizontal" ? "size-20" : "size-14"} object-contain`}
                  />
                ) : (
                  <PatchyMascot
                    className={`${orientation === "horizontal" ? "size-20" : "size-14"} object-contain`}
                    pose={profile.avatar ?? style.pose}
                    decorative
                  />
                )}
                <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-brand text-[0.65rem] font-black text-brand-foreground">
                  {profile.level}
                </span>
              </div>
              <div className={`min-w-0 ${orientation === "horizontal" ? "mt-2" : "flex-1"}`}>
                <p className={`truncate text-sm font-black ${style.body}`}>@{displayName}</p>
                <p className={`mt-0.5 text-[0.65rem] font-semibold leading-tight ${style.label}`}>
                  {profile.title}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-black/10 p-1.5">
                <p className={`text-base font-black ${style.body}`}>{profile.weeklyStreak}</p>
                <p className={`text-[0.58rem] uppercase ${style.label}`}>Serie</p>
              </div>
              <div className="rounded-lg bg-black/10 p-1.5">
                <p className={`text-base font-black ${style.body}`}>{profile.publishedPatches}</p>
                <p className={`text-[0.58rem] uppercase ${style.label}`}>Patch</p>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    );
  },
);
