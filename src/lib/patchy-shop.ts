export interface ShopCosmetic {
  id: string;
  name: string;
  description: string;
  price: number;
  previewClass: string;
  rarity: "Comune" | "Raro" | "Epico" | "Leggendario";
}

export const SHOP_COSMETICS: readonly ShopCosmetic[] = [
  {
    id: "frame-arcade",
    name: "Cabinet scassato",
    description: "Neon da sala giochi e odore immaginario di gettoni persi.",
    price: 40,
    previewClass: "profile-frame-arcade",
    rarity: "Comune",
  },
  {
    id: "frame-mushroom",
    name: "Regno dei tubi abusivi",
    description: "Mattoni, monete e fiscalità molto creativa.",
    price: 75,
    previewClass: "profile-frame-mushroom",
    rarity: "Raro",
  },
  {
    id: "frame-bonfire",
    name: "Falò del lunedì",
    description: "Riposa. Tanto domani la settimana ricomincia comunque.",
    price: 100,
    previewClass: "profile-frame-bonfire",
    rarity: "Raro",
  },
  {
    id: "frame-wasteland",
    name: "Vault condominiale",
    description: "Protegge dalle radiazioni, non dalle riunioni di condominio.",
    price: 125,
    previewClass: "profile-frame-wasteland",
    rarity: "Epico",
  },
  {
    id: "frame-red-ring",
    name: "Anello della bestemmia",
    description: "Per chi ha perso le rune nello stesso punto due volte.",
    price: 175,
    previewClass: "profile-frame-red-ring",
    rarity: "Epico",
  },
  {
    id: "frame-golden-warrior",
    name: "Aura oltre novemila",
    description: "Discreta come un urlo che dura tre episodi.",
    price: 250,
    previewClass: "profile-frame-golden-warrior",
    rarity: "Leggendario",
  },
] as const;

export function profileFrameClass(id: string | null): string {
  return SHOP_COSMETICS.find((item) => item.id === id)?.previewClass ?? "";
}
