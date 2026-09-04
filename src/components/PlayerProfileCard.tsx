import { Link } from "@tanstack/react-router";
import {
  FileCheck2,
  Flame,
  Gamepad2,
  ListChecks,
  Palette,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import { BitCoin } from "@/components/BitCoin";
import type { Patch, ProfileAvatar } from "@/lib/patch-model";
import { usePlayerProgression } from "@/hooks/use-player-progression";
import { PatchyMascot } from "@/components/PatchyMascot";
import { cosmeticById, profileEffectClass, profileFrameClass } from "@/lib/patchy-shop";
import { hardcoreCopy } from "@/lib/hardcore-copy";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";

interface PlayerProfileCardProps {
  username: string;
  displayName: string;
  patches: readonly Patch[];
  avatar: ProfileAvatar;
  superSaiyanUnlocked: boolean;
  onUnlockSuperSaiyan: () => boolean;
  hardcoreMode?: boolean;
}

export function PlayerProfileCard({
  username,
  displayName,
  patches,
  avatar,
  superSaiyanUnlocked,
  onUnlockSuperSaiyan,
  hardcoreMode = false,
}: PlayerProfileCardProps) {
  const {
    progression,
    bits,
    equippedProfileFrameId,
    equippedAvatarId,
    equippedProfileEffectId,
    levelUp,
    streakCelebration,
    handleSecretTap,
  } = usePlayerProgression({ patches, displayName, superSaiyanUnlocked, onUnlockSuperSaiyan });
  const equippedAvatar = cosmeticById(equippedAvatarId);

  return (
    <section
      className={`surface-card relative overflow-hidden p-4 ${profileFrameClass(equippedProfileFrameId)} ${profileEffectClass(equippedProfileEffectId)} ${levelUp ? "player-level-up" : ""}`}
      aria-labelledby="player-profile-title"
    >
      {levelUp ? <LevelUpCelebration level={progression.level} title={progression.title} /> : null}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          hash="avatar"
          aria-label="Cambia avatar"
          className="tap-safe relative shrink-0 rounded-2xl transition-transform hover:scale-105"
        >
          {equippedAvatar?.imageSrc ? (
            <img src={equippedAvatar.imageSrc} alt="" className="size-20 object-contain" />
          ) : (
            <PatchyMascot className="size-20 object-contain" pose={avatar} decorative />
          )}
          <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-brand text-xs font-black text-brand-foreground">
            {progression.level}
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            {hardcoreCopy(hardcoreMode, "Profilo giocatore", "Scheda del disagiato")}
          </p>
          <h2 id="player-profile-title" className="truncate text-xl font-extrabold text-foreground">
            {displayName || "Giocatore"} · Livello {progression.level}
          </h2>
          <p className="truncate text-xs font-bold text-brand">@{username || "username"}</p>
          <p className="text-sm font-semibold text-muted-foreground">{progression.title}</p>
        </div>
        <button
          type="button"
          onClick={handleSecretTap}
          className="tap-safe shrink-0 rounded-lg p-2 text-brand"
          aria-label="Trofei del profilo"
        >
          <Trophy className="size-6" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex justify-between gap-3 text-xs font-semibold text-muted-foreground">
          <span>{progression.totalXp} XP totali</span>
          <span>
            {progression.xpIntoLevel}/{progression.xpPerLevel} XP
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Esperienza verso il livello ${progression.level + 1}`}
          aria-valuemin={0}
          aria-valuemax={progression.xpPerLevel}
          aria-valuenow={progression.xpIntoLevel}
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="xp-progress h-full rounded-full bg-brand transition-[width] duration-700"
            style={{ width: `${progression.progressPercent}%` }}
          />
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 text-[0.68rem] font-semibold text-muted-foreground">
          <Sparkles className="size-3 text-brand" aria-hidden="true" />
          100 XP per patch + 10 XP per voce
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <FileCheck2 className="mx-auto size-4 text-brand" aria-hidden="true" />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {hardcoreCopy(hardcoreMode, "Pubblicate", "Danni pubblicati")}
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.publishedPatches}</dd>
        </div>
        <div
          className={`rounded-lg border border-border bg-surface-2 p-2 ${
            streakCelebration ? "streak-celebrate" : ""
          }`}
        >
          <Flame
            className={`mx-auto size-4 text-brand ${streakCelebration ? "streak-flame" : ""}`}
            aria-hidden="true"
          />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {hardcoreCopy(hardcoreMode, "Serie", "Ossessione")}
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.weeklyStreak}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <ListChecks className="mx-auto size-4 text-brand" aria-hidden="true" />
          <dt className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {hardcoreCopy(hardcoreMode, "Voci", "Stronzate scritte")}
          </dt>
          <dd className="text-lg font-black text-foreground">{progression.totalItems}</dd>
        </div>
      </dl>

      <Link
        to="/profile"
        className="tap-safe mt-4 flex items-center gap-3 rounded-xl border border-brand/35 bg-brand/10 px-3 py-2.5 text-foreground transition-colors hover:bg-brand/15"
      >
        <Palette className="size-5 shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black">
            {hardcoreCopy(hardcoreMode, "Personalizza profilo", "Rifatti la faccia")}
          </span>
          <span className="block text-xs text-muted-foreground">
            {hardcoreCopy(
              hardcoreMode,
              "Scegli avatar, cornice, effetto e futuri sfondi",
              "Avatar, cornici e altra roba inutile ma figa",
            )}
          </span>
        </span>
      </Link>

      <Link
        to="/progress"
        className="tap-safe mt-3 flex items-center gap-3 rounded-xl border border-brand/35 bg-brand/10 px-3 py-2.5 text-foreground transition-colors hover:bg-brand/15"
      >
        <Gamepad2 className="size-5 shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black">
            {hardcoreCopy(
              hardcoreMode,
              "Titoli, missioni e trofei",
              "Missioni per chi non ha un cazzo da fare",
            )}
          </span>
          <span className="block text-xs text-muted-foreground">
            {hardcoreCopy(
              hardcoreMode,
              "Apri la raccolta senza perdere di vista le patch",
              "Controlla quanto tempo hai già sprecato",
            )}
          </span>
        </span>
        <span className="shrink-0 text-xs font-black text-brand">
          {progression.missions.filter((mission) => mission.completed).length}/
          {progression.missions.length}
        </span>
      </Link>

      <Link
        to="/shop"
        className="tap-safe mt-3 flex items-center gap-3 rounded-xl border border-amber-400/35 bg-amber-400/10 px-3 py-2.5 text-foreground transition-colors hover:bg-amber-400/15"
      >
        <ShoppingBag className="size-5 shrink-0 text-amber-400" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black">
            {hardcoreCopy(hardcoreMode, "Patchy Shop", "Emporio delle minchiate")}
          </span>
          <span className="block text-xs text-muted-foreground">
            {hardcoreCopy(
              hardcoreMode,
              "Spendi i Bit in cosmetici inutilmente belli",
              "Brucia Bit per sembrare meno anonimo",
            )}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-black text-amber-400">
          <BitCoin className="size-4" /> {bits}
        </span>
      </Link>
      <p className="mt-2 text-center text-[0.65rem] leading-relaxed text-muted-foreground">
        I 44 Bit iniziali vengono assegnati automaticamente una sola volta a ogni profilo locale,
        esistente o nuovo.
      </p>

      {progression.publishedPatches === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {hardcoreCopy(
            hardcoreMode,
            "Pubblica la prima patch per guadagnare XP e iniziare la tua serie.",
            "Pubblica qualcosa, scansafatiche: gli XP non si materializzano da soli.",
          )}
        </p>
      ) : null}
    </section>
  );
}
