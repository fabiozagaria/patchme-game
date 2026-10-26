import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { LockKeyhole, Palette, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { SHOP_COLLECTIONS, SHOP_COSMETICS, type ShopCosmetic } from "@/lib/patchy-shop";
import {
  EMPTY_PROGRESSION_STATE,
  claimDailyShopReward,
  DAILY_SHOP_REWARD_BITS,
  loadProgressionState,
  purchaseCosmetic,
  saveProgressionState,
  type ProgressionState,
} from "@/lib/progression-repository";
import { useAppStore } from "@/state/app-store";
import { hardcoreCopy } from "@/lib/hardcore-copy";
import { BitCoin } from "@/components/BitCoin";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Patchy Shop — PatchMe" },
      { name: "description", content: "Spendi i Bit e personalizza il profilo di PatchMe." },
    ],
  }),
  component: ShopPage,
});

const KIND_LABELS = { avatar: "Avatar", frame: "Cornice", effect: "Effetto" } as const;

function ShopPage() {
  const { ready, settings } = useAppStore();
  const [progression, setProgression] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loaded = loadProgressionState();
    const dailyShopReward = claimDailyShopReward(loaded);
    if (dailyShopReward.claimed) {
      saveProgressionState(dailyShopReward.state);
      enqueueSuccessNotification(`Regalo del negozio: +${DAILY_SHOP_REWARD_BITS} Bit`, {
        description: "Torna domani per altri 2 Bit.",
        sound: "xp",
      });
    }
    setProgression(dailyShopReward.state);
  }, []);

  const commit = (next: ProgressionState) => {
    saveProgressionState(next);
    setProgression(next);
  };

  const buy = (item: ShopCosmetic) => {
    if (
      item.requiredMissionId &&
      !progression.completedMissionIds.includes(item.requiredMissionId)
    ) {
      setMessage(`Prima completa il trofeo: ${item.requirementLabel}.`);
      return;
    }
    const result = purchaseCosmetic(progression, item.id, item.price);
    if (!result.ok) {
      setMessage(
        result.reason === "insufficient-bits"
          ? "Bit insufficienti. Patchy non accetta pagherò."
          : "Questo cosmetico è già nel tuo inventario.",
      );
      return;
    }
    commit(result.state);
    setMessage(`${item.name} aggiunto all'inventario.`);
    enqueueSuccessNotification(`${item.name} acquistato`, {
      description: `-${item.price} Bit · Ora puoi equipaggiarlo`,
      sound: "trophy",
    });
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader
        title={hardcoreCopy(settings.hardcoreMode, "Patchy Shop", "Negozio di cazzate costose")}
        subtitle={hardcoreCopy(
          settings.hardcoreMode,
          "Cosmetici completamente necessari",
          "Butta qui i tuoi Bit, campione",
        )}
        backTo="/"
        action={
          <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-black text-amber-400">
            <BitCoin className="size-4" /> {progression.bits}
          </span>
        }
      />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <section className="surface-card overflow-hidden p-4" aria-labelledby="shop-title">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
              <ShoppingBag aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="shop-title" className="text-xl font-black uppercase text-foreground">
                {hardcoreCopy(
                  settings.hardcoreMode,
                  "Negozio cosmetico",
                  "Emporio delle minchiate",
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                Avatar, cornici ed effetti coordinati. I cosmetici non danno vantaggi; alcuni
                richiedono un trofeo prima dell'acquisto.
              </p>
              <p className="mt-2 text-xs font-bold text-amber-400">
                +{DAILY_SHOP_REWARD_BITS} Bit gratis al primo ingresso di ogni giorno.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/profile">
              <Palette className="mr-2 size-4" /> Personalizza il profilo
            </Link>
          </Button>
          {message ? (
            <p
              role="status"
              className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground"
            >
              {message}
            </p>
          ) : null}
        </section>

        <div className="mt-6 space-y-7">
          {SHOP_COLLECTIONS.map((collection) => {
            const items = SHOP_COSMETICS.filter((item) => item.collection === collection);
            return (
              <section
                key={collection}
                aria-labelledby={`collection-${collection.replaceAll(" ", "-")}`}
              >
                <h2
                  id={`collection-${collection.replaceAll(" ", "-")}`}
                  className="display text-xl font-black uppercase text-foreground"
                >
                  Collezione {collection}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Combina avatar, cornice ed effetto come preferisci.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((item) => {
                    const owned = progression.ownedCosmeticIds.includes(item.id);
                    const requirementMet =
                      !item.requiredMissionId ||
                      progression.completedMissionIds.includes(item.requiredMissionId);
                    const affordable = progression.bits >= item.price;
                    return (
                      <article
                        key={item.id}
                        className={`surface-card overflow-hidden p-4 ${item.kind !== "avatar" ? (item.previewClass ?? "") : ""}`}
                      >
                        {item.imageSrc ? (
                          <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-surface-2">
                            <img
                              src={item.imageSrc}
                              alt={item.name}
                              className="block h-40 w-full object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black uppercase text-brand">
                            {KIND_LABELS[item.kind]} · {item.rarity}
                          </p>
                          <span className="flex items-center gap-1 text-sm font-black text-amber-400">
                            <BitCoin className="size-4" />{" "}
                            {item.price === 0 ? "Gratis" : item.price}
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg font-black text-foreground">{item.name}</h3>
                        <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        {!requirementMet ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs font-bold text-amber-400">
                            <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{" "}
                            Trofeo richiesto: {item.requirementLabel}
                          </p>
                        ) : null}
                        {owned ? (
                          <Button asChild className="mt-4 w-full" variant="outline">
                            <Link to="/profile">
                              <Palette className="mr-2 size-4" /> Gestisci nel profilo
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            className="mt-4 w-full"
                            disabled={!requirementMet || !affordable}
                            onClick={() => buy(item)}
                          >
                            {!requirementMet || !affordable ? (
                              <LockKeyhole className="mr-2 size-4" />
                            ) : (
                              <Sparkles className="mr-2 size-4" />
                            )}{" "}
                            {item.price === 0 ? "Riscatta gratis" : "Compra"}
                          </Button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
