import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Check, Coins, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { SHOP_COSMETICS } from "@/lib/patchy-shop";
import {
  EMPTY_PROGRESSION_STATE,
  equipProfileFrame,
  loadProgressionState,
  purchaseCosmetic,
  saveProgressionState,
  type ProgressionState,
} from "@/lib/progression-repository";
import { useAppStore } from "@/state/app-store";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Patchy Shop — PatchMe" },
      { name: "description", content: "Spendi i Bit e personalizza il profilo di PatchMe." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { ready, settings } = useAppStore();
  const [progression, setProgression] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);
  const [message, setMessage] = useState("");

  useEffect(() => setProgression(loadProgressionState()), []);

  const commit = (next: ProgressionState) => {
    saveProgressionState(next);
    setProgression(next);
  };

  const buy = (id: string, name: string, price: number) => {
    const result = purchaseCosmetic(progression, id, price);
    if (!result.ok) {
      setMessage(
        result.reason === "insufficient-bits"
          ? "Bit insufficienti. Patchy non accetta pagherò."
          : "Questo cosmetico è già nel tuo inventario.",
      );
      return;
    }
    commit(result.state);
    setMessage(`${name} aggiunto all'inventario.`);
    enqueueSuccessNotification(`${name} acquistato`, {
      description: `-${price} Bit · Ora puoi equipaggiarlo`,
      sound: "trophy",
    });
  };

  const equip = (id: string | null, name: string) => {
    const result = equipProfileFrame(progression, id);
    if (!result.ok) return;
    commit(result.state);
    setMessage(`${name} equipaggiato.`);
    enqueueSuccessNotification(`${name} equipaggiato`, { sound: "xp" });
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader
        title="Patchy Shop"
        subtitle="Cosmetici completamente necessari"
        backTo="/"
        action={
          <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-black text-amber-400">
            <Coins className="size-4" aria-hidden="true" /> {progression.bits}
          </span>
        }
      />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <section className="surface-card overflow-hidden p-4" aria-labelledby="shop-title">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
              <ShoppingBag aria-hidden="true" />
            </span>
            <div>
              <h2 id="shop-title" className="text-xl font-black uppercase text-foreground">
                Negozio cosmetico
              </h2>
              <p className="text-sm text-muted-foreground">
                Ottieni Bit completando missioni ed easter egg. Gli acquisti cambiano solo l'aspetto
                e non danno vantaggi.
              </p>
            </div>
          </div>
          {message ? (
            <p
              role="status"
              className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground"
            >
              {message}
            </p>
          ) : null}
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Cornici disponibili">
          <article
            className={`surface-card p-4 ${progression.equippedProfileFrameId === null ? "ring-2 ring-brand" : ""}`}
          >
            <p className="text-xs font-black uppercase text-muted-foreground">Di serie</p>
            <h3 className="mt-1 text-lg font-black text-foreground">Telaio originale</h3>
            <p className="mt-1 min-h-10 text-sm text-muted-foreground">
              Sobrio, gratuito e privo di microtransazioni.
            </p>
            <Button
              className="mt-4 w-full"
              variant={progression.equippedProfileFrameId === null ? "secondary" : "outline"}
              disabled={progression.equippedProfileFrameId === null}
              onClick={() => equip(null, "Telaio originale")}
            >
              {progression.equippedProfileFrameId === null ? (
                <>
                  <Check className="mr-2 size-4" /> Equipaggiato
                </>
              ) : (
                "Equipaggia"
              )}
            </Button>
          </article>

          {SHOP_COSMETICS.map((item) => {
            const owned = progression.ownedCosmeticIds.includes(item.id);
            const equipped = progression.equippedProfileFrameId === item.id;
            return (
              <article
                key={item.id}
                className={`surface-card p-4 ${item.previewClass} ${equipped ? "ring-2 ring-brand" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase text-brand">{item.rarity}</p>
                  <span className="flex items-center gap-1 text-sm font-black text-amber-400">
                    <Coins className="size-4" /> {item.price}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-black text-foreground">{item.name}</h3>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{item.description}</p>
                {owned ? (
                  <Button
                    className="mt-4 w-full"
                    variant={equipped ? "secondary" : "outline"}
                    disabled={equipped}
                    onClick={() => equip(item.id, item.name)}
                  >
                    {equipped ? (
                      <>
                        <Check className="mr-2 size-4" /> Equipaggiato
                      </>
                    ) : (
                      "Equipaggia"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="mt-4 w-full"
                    disabled={progression.bits < item.price}
                    onClick={() => buy(item.id, item.name, item.price)}
                  >
                    {progression.bits < item.price ? (
                      <LockKeyhole className="mr-2 size-4" />
                    ) : (
                      <Sparkles className="mr-2 size-4" />
                    )}{" "}
                    Compra
                  </Button>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
