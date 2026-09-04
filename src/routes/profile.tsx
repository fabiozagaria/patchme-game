import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Check, Image, Palette, RotateCcw, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PatchyMascot } from "@/components/PatchyMascot";
import { Button } from "@/components/ui/button";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import {
  cosmeticById,
  equippedCosmeticId,
  profileEffectClass,
  profileFrameClass,
  SHOP_COSMETICS,
  type ShopCosmetic,
} from "@/lib/patchy-shop";
import {
  EMPTY_PROGRESSION_STATE,
  equipCosmetic,
  loadProgressionState,
  resetEquippedCosmetics,
  saveProgressionState,
  type CosmeticSlot,
  type ProgressionState,
} from "@/lib/progression-repository";
import { useAppStore } from "@/state/app-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profilo — PatchMe" },
      {
        name: "description",
        content: "Personalizza avatar, cornice, effetto e sfondo del tuo profilo PatchMe.",
      },
    ],
  }),
  component: ProfilePage,
});

const SLOT_COPY: Record<
  Exclude<CosmeticSlot, "background">,
  { title: string; description: string; empty: string }
> = {
  avatar: {
    title: "Avatar",
    description: "Scegli quale versione discutibile di Patchy mostrare.",
    empty: "Patchy originale",
  },
  frame: {
    title: "Cornice",
    description: "Inquadra con eleganza le tue pessime decisioni.",
    empty: "Cornice base",
  },
  effect: {
    title: "Effetto",
    description: "Aggiungi un'animazione completamente necessaria.",
    empty: "Nessun effetto",
  },
};

function ProfilePage() {
  const { ready, settings } = useAppStore();
  const [progression, setProgression] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);
  const equippedAvatar = cosmeticById(progression.equippedAvatarId);

  useEffect(() => setProgression(loadProgressionState()), []);

  const commit = (next: ProgressionState, message: string) => {
    saveProgressionState(next);
    setProgression(next);
    enqueueSuccessNotification(message, { sound: "xp" });
  };

  const selectItem = (item: ShopCosmetic) => {
    const result = equipCosmetic(progression, item.id, item.kind);
    if (result.ok) commit(result.state, `${item.name} equipaggiato`);
  };

  const clearSlot = (slot: Exclude<CosmeticSlot, "background">) => {
    const field = {
      avatar: "equippedAvatarId",
      frame: "equippedProfileFrameId",
      effect: "equippedProfileEffectId",
    }[slot] as "equippedAvatarId" | "equippedProfileFrameId" | "equippedProfileEffectId";
    commit({ ...progression, [field]: null }, `${SLOT_COPY[slot].empty} selezionato`);
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader title="Profilo" subtitle="Il camerino di Patchy" backTo="/" />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <section
          className={`surface-card relative overflow-hidden p-5 ${profileFrameClass(progression.equippedProfileFrameId)} ${profileEffectClass(progression.equippedProfileEffectId)}`}
          aria-labelledby="profile-preview-title"
        >
          <div className="flex items-center gap-4">
            {equippedAvatar?.imageSrc ? (
              <img
                src={equippedAvatar.imageSrc}
                alt=""
                className="size-24 shrink-0 object-contain"
              />
            ) : (
              <PatchyMascot pose={settings.profileAvatar} className="size-24 shrink-0" decorative />
            )}
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-brand">
                Anteprima dal vivo
              </p>
              <h1
                id="profile-preview-title"
                className="truncate text-2xl font-black text-foreground"
              >
                @{settings.displayName || "username"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ogni scelta viene applicata e salvata immediatamente.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => commit(resetEquippedCosmetics(progression), "Aspetto base ripristinato")}
          >
            <RotateCcw className="mr-2 size-4" /> Ripristina tutto
          </Button>
        </section>

        {(["avatar", "frame", "effect"] as const).map((slot) => {
          const copy = SLOT_COPY[slot];
          const items = SHOP_COSMETICS.filter(
            (item) => item.kind === slot && progression.ownedCosmeticIds.includes(item.id),
          );
          const selectedId = equippedCosmeticId(progression, slot);
          return (
            <section key={slot} className="surface-card p-4" aria-labelledby={`profile-${slot}`}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  {slot === "avatar" ? <UserRound /> : slot === "frame" ? <Image /> : <Sparkles />}
                </span>
                <div>
                  <h2 id={`profile-${slot}`} className="text-lg font-black text-foreground">
                    {copy.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{copy.description}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={selectedId === null}
                  onClick={() => clearSlot(slot)}
                  className={`tap-safe flex min-h-14 items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-bold ${selectedId === null ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground"}`}
                >
                  {copy.empty}
                  {selectedId === null ? <Check className="size-4 text-brand" /> : null}
                </button>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selectedId === item.id}
                    onClick={() => selectItem(item)}
                    className={`tap-safe flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-left ${selectedId === item.id ? "border-brand bg-brand/10" : "border-border"}`}
                  >
                    {item.imageSrc ? (
                      <img src={item.imageSrc} alt="" className="size-10 shrink-0 object-contain" />
                    ) : (
                      <span
                        className={`size-8 shrink-0 rounded-lg border ${item.previewClass ?? ""}`}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                      {item.name}
                    </span>
                    {selectedId === item.id ? (
                      <Check className="size-4 shrink-0 text-brand" />
                    ) : null}
                  </button>
                ))}
              </div>
              {items.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Non possiedi ancora alternative per questo slot. Visita lo Shop per sbloccarne.
                </p>
              ) : null}
            </section>
          );
        })}

        <section className="surface-card border-dashed p-4" aria-labelledby="profile-background">
          <div className="flex items-start gap-3 opacity-75">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
              <Image aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="profile-background" className="text-lg font-black text-foreground">
                  Sfondo
                </h2>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-black uppercase text-muted-foreground">
                  Prossimamente
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Qui equipaggerai gli sfondi acquistati nelle prossime versioni.
              </p>
            </div>
          </div>
        </section>

        <Button asChild className="w-full" variant="outline">
          <Link to="/shop">
            <ShoppingBag className="mr-2 size-4" /> Compra altri cosmetici
          </Link>
        </Button>
      </main>
    </div>
  );
}
