import type { CosmeticSlot } from "@/lib/progression-repository";

export interface ShopCosmetic {
  id: string;
  kind: CosmeticSlot;
  collection:
    | "Arcade"
    | "Guerriero dorato"
    | "Anime morte male"
    | "Survival horror"
    | "Zona contaminata"
    | "Compagni di Patchy"
    | "Guardiana lunare";
  name: string;
  description: string;
  price: number;
  previewClass?: string;
  imageSrc?: string;
  rarity: "Comune" | "Raro" | "Epico" | "Leggendario";
  requiredMissionId?: string;
  requirementLabel?: string;
}

export const SHOP_COSMETICS: readonly ShopCosmetic[] = [
  {
    id: "avatar-cat",
    kind: "avatar",
    collection: "Compagni di Patchy",
    name: "Patchy Gatto",
    description: "Fa cadere i tuoi trofei dal mobile e poi pretende i croccantini.",
    price: 0,
    imageSrc: "/assets/patchy-cat.svg",
    rarity: "Comune",
  },
  {
    id: "avatar-dog",
    kind: "avatar",
    collection: "Compagni di Patchy",
    name: "Patchy Cane",
    description: "Fedele, entusiasta e incapace di capire perché hai perso la serie.",
    price: 0,
    imageSrc: "/assets/patchy-dog.svg",
    rarity: "Comune",
  },
  {
    id: "avatar-moon-guardian",
    kind: "avatar",
    collection: "Guardiana lunare",
    name: "Patchy Guardiana Lunare",
    description: "Combatte bug e pessime decisioni nel nome della Luna.",
    price: 0,
    imageSrc: "/assets/patchy-moon-guardian.svg",
    rarity: "Leggendario",
    requiredMissionId: "moon-guardian",
    requirementLabel: "Punisci il male in nome della Luna",
  },
  {
    id: "frame-arcade",
    kind: "frame",
    collection: "Arcade",
    name: "Cabinet scassato",
    description: "Neon da sala giochi e odore immaginario di gettoni persi.",
    price: 40,
    previewClass: "profile-frame-arcade",
    rarity: "Comune",
  },
  {
    id: "frame-mushroom",
    kind: "frame",
    collection: "Arcade",
    name: "Regno dei tubi abusivi",
    description: "Mattoni, monete e fiscalità molto creativa.",
    price: 75,
    previewClass: "profile-frame-mushroom",
    rarity: "Raro",
  },
  {
    id: "frame-wasteland",
    kind: "frame",
    collection: "Zona contaminata",
    name: "Vault condominiale",
    description: "Protegge dalle radiazioni, non dalle riunioni di condominio.",
    price: 125,
    previewClass: "profile-frame-wasteland",
    rarity: "Epico",
  },
  {
    id: "avatar-golden-warrior",
    kind: "avatar",
    collection: "Guerriero dorato",
    name: "Patchy Guerriero Dorato",
    description: "Ha superato il limite. La bolletta della luce pure.",
    price: 180,
    imageSrc: "/assets/patchy-golden-warrior.png",
    rarity: "Leggendario",
    requiredMissionId: "dragon-ball-goku",
    requirementLabel: "Chiedi al nemico di trasformarsi al massimo",
  },
  {
    id: "frame-golden-warrior",
    kind: "frame",
    collection: "Guerriero dorato",
    name: "Aura oltre novemila",
    description: "Discreta come un urlo che dura tre episodi.",
    price: 140,
    previewClass: "profile-frame-golden-warrior",
    rarity: "Epico",
  },
  {
    id: "effect-golden-warrior",
    kind: "effect",
    collection: "Guerriero dorato",
    name: "Ki fiscalmente instabile",
    description: "Fa pulsare il profilo come se stesse caricando da martedì.",
    price: 90,
    previewClass: "profile-effect-golden-warrior",
    rarity: "Raro",
  },
  {
    id: "avatar-undead",
    kind: "avatar",
    collection: "Anime morte male",
    name: "Patchy Non-morto",
    description: "È morto, è tornato e ancora non ha capito come si para.",
    price: 160,
    imageSrc: "/assets/patchy-undead.png",
    rarity: "Leggendario",
    requiredMissionId: "dark-souls-sun",
    requirementLabel: "Loda il Sole senza rotolare giù da un dirupo",
  },
  {
    id: "frame-bonfire",
    kind: "frame",
    collection: "Anime morte male",
    name: "Falò del lunedì",
    description: "Riposa. Tanto domani la settimana ricomincia comunque.",
    price: 100,
    previewClass: "profile-frame-bonfire",
    rarity: "Raro",
  },
  {
    id: "effect-embers",
    kind: "effect",
    collection: "Anime morte male",
    name: "Brace residua",
    description: "Un bagliore caldo per decisioni fredde e sbagliate.",
    price: 80,
    previewClass: "profile-effect-embers",
    rarity: "Raro",
  },
  {
    id: "avatar-survivor",
    kind: "avatar",
    collection: "Survival horror",
    name: "Patchy Sopravvissuto",
    description: "Torcia enorme, inventario minuscolo e zero munizioni.",
    price: 170,
    imageSrc: "/assets/patchy-survivor.png",
    rarity: "Leggendario",
    requiredMissionId: "resident-evil-mansion",
    requirementLabel: "Sopravvivi alla villa della Umbrella",
  },
  {
    id: "frame-survival",
    kind: "frame",
    collection: "Survival horror",
    name: "Inventario impossibile",
    description: "Verde militare, emergenza rossa e soltanto otto spazi.",
    price: 110,
    previewClass: "profile-frame-survival",
    rarity: "Epico",
  },
  {
    id: "effect-danger",
    kind: "effect",
    collection: "Survival horror",
    name: "Stato: Fine",
    description: "Luce d'emergenza. La salute probabilmente non va benissimo.",
    price: 85,
    previewClass: "profile-effect-danger",
    rarity: "Raro",
  },
  {
    id: "frame-red-ring",
    kind: "frame",
    collection: "Anime morte male",
    name: "Anello della bestemmia",
    description: "Per chi ha perso le rune nello stesso punto due volte.",
    price: 175,
    previewClass: "profile-frame-red-ring",
    rarity: "Epico",
  },
] as const;

export const SHOP_COLLECTIONS = [
  "Compagni di Patchy",
  "Guardiana lunare",
  "Guerriero dorato",
  "Anime morte male",
  "Survival horror",
  "Arcade",
  "Zona contaminata",
] as const;

export function cosmeticById(id: string | null) {
  return SHOP_COSMETICS.find((item) => item.id === id);
}

export function profileFrameClass(id: string | null): string {
  return cosmeticById(id)?.previewClass ?? "";
}

export function profileEffectClass(id: string | null): string {
  return cosmeticById(id)?.previewClass ?? "";
}

export function equippedCosmeticId(
  state: {
    equippedProfileFrameId: string | null;
    equippedAvatarId: string | null;
    equippedProfileEffectId: string | null;
    equippedProfileBackgroundId: string | null;
  },
  kind: CosmeticSlot,
): string | null {
  return {
    frame: state.equippedProfileFrameId,
    avatar: state.equippedAvatarId,
    effect: state.equippedProfileEffectId,
    background: state.equippedProfileBackgroundId,
  }[kind];
}
