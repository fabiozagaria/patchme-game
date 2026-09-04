import { useEffect, useMemo, useRef, useState } from "react";
import type { Patch } from "@/lib/patch-model";
import { enqueueSuccessNotification } from "@/lib/notification-queue";
import { calculatePlayerProgression, SUPER_SAIYAN_MISSION } from "@/lib/player-progression";
import {
  awardMission,
  EMPTY_PROGRESSION_STATE,
  loadProgressionState,
  saveProgressionState,
  type ProgressionState,
} from "@/lib/progression-repository";

interface UsePlayerProgressionOptions {
  patches: readonly Patch[];
  displayName: string;
  superSaiyanUnlocked: boolean;
  onUnlockSuperSaiyan: () => boolean;
}

export function usePlayerProgression({
  patches,
  displayName,
  superSaiyanUnlocked,
  onUnlockSuperSaiyan,
}: UsePlayerProgressionOptions) {
  const [persisted, setPersisted] = useState<ProgressionState>(EMPTY_PROGRESSION_STATE);
  const [ready, setReady] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [streakCelebration, setStreakCelebration] = useState(false);
  const secretTapCount = useRef(0);
  const secretClaimed = useRef(false);

  const progression = useMemo(
    () =>
      calculatePlayerProgression(
        patches,
        displayName,
        persisted.completedMissionIds,
        persisted.missionXp,
        new Date(),
        persisted.highestStreak,
      ),
    [displayName, patches, persisted],
  );
  const rewardByMissionId = useMemo(
    () => new Map(progression.missions.map((mission) => [mission.id, mission.rewardXp])),
    [progression.missions],
  );
  const completedMissionIds = useMemo(
    () => progression.missions.filter((mission) => mission.completed).map((mission) => mission.id),
    [progression.missions],
  );
  const completedMissionKey = completedMissionIds.join(",");
  const claimedBitRewardKey = persisted.claimedBitRewardMissionIds.join(",");

  const updatePersisted = (updater: (current: ProgressionState) => ProgressionState) => {
    setPersisted((current) => {
      const next = updater(current);
      if (next !== current) saveProgressionState(next);
      return next;
    });
  };

  useEffect(() => {
    if (ready) return;
    setPersisted(loadProgressionState(rewardByMissionId));
    setReady(true);
  }, [ready, rewardByMissionId]);

  useEffect(() => {
    if (!ready) return;
    const saved = new Set(persisted.completedMissionIds);
    const bitRewardsClaimed = new Set(persisted.claimedBitRewardMissionIds);
    const newlyCompleted = progression.missions.filter(
      (mission) => mission.completed && !saved.has(mission.id),
    );
    const missingBitRewards = progression.missions.filter(
      (mission) => mission.completed && !bitRewardsClaimed.has(mission.id),
    );
    if (newlyCompleted.length === 0 && missingBitRewards.length === 0) return;

    updatePersisted((current) =>
      missingBitRewards.reduce(
        (next, mission) => awardMission(next, mission.id, mission.rewardXp, mission.rewardBits),
        current,
      ),
    );
    newlyCompleted.forEach((mission) =>
      enqueueSuccessNotification(`Trofeo sbloccato: ${mission.title}`, {
        description: `Missione completata · +${mission.rewardXp} XP · +${mission.rewardBits} Bit`,
        sound: "trophy",
        duration: 5000,
      }),
    );
    const retroactiveBits = missingBitRewards
      .filter((mission) => saved.has(mission.id))
      .reduce((total, mission) => total + mission.rewardBits, 0);
    if (retroactiveBits > 0) {
      enqueueSuccessNotification(`+${retroactiveBits} Bit retroattivi`, {
        description: "Ricompense recuperate dalle missioni che avevi già completato.",
        sound: "xp",
      });
    }
  }, [
    claimedBitRewardKey,
    completedMissionKey,
    persisted.completedMissionIds,
    persisted.claimedBitRewardMissionIds,
    progression.missions,
    ready,
  ]);

  useEffect(() => {
    if (!ready || progression.weeklyStreak <= persisted.highestStreak) return;
    const previousStreak = persisted.highestStreak;
    updatePersisted((current) => ({
      ...current,
      highestStreak: Math.max(current.highestStreak, progression.weeklyStreak),
    }));
    if (previousStreak === 0 && persisted.lastXp === null) return;

    setStreakCelebration(true);
    enqueueSuccessNotification(
      previousStreak === 0
        ? "SERIE INIZIATA! Il falò è acceso."
        : `SERIE CONTINUATA! ${progression.weeklyStreak} settimane`,
      {
        description: "Patchy approva questa discutibile costanza.",
        sound: "streak",
        duration: 5000,
      },
    );
  }, [persisted.highestStreak, persisted.lastXp, progression.weeklyStreak, ready]);

  useEffect(() => {
    if (!streakCelebration) return;
    const timer = window.setTimeout(() => setStreakCelebration(false), 3600);
    return () => window.clearTimeout(timer);
  }, [streakCelebration]);

  useEffect(() => {
    if (!ready || persisted.lastXp === progression.totalXp) return;
    const previousXp = persisted.lastXp;
    updatePersisted((current) => ({ ...current, lastXp: progression.totalXp }));
    if (previousXp === null) return;

    const gainedXp = progression.totalXp - previousXp;
    if (gainedXp <= 0) return;
    const previousLevel = Math.floor(previousXp / progression.xpPerLevel) + 1;
    enqueueSuccessNotification(`+${gainedXp} XP guadagnati`, {
      description: "Ricompensa aggiunta al profilo. Il tempo perso ora ha un valore.",
      sound: "xp",
    });
    if (progression.level <= previousLevel) return;

    setLevelUp(true);
    enqueueSuccessNotification(`LEVEL UP! Ora sei livello ${progression.level}`, {
      description: progression.title,
      sound: "level-up",
      duration: 5000,
    });
  }, [persisted.lastXp, progression, ready]);

  useEffect(() => {
    if (!levelUp) return;
    const timer = window.setTimeout(() => setLevelUp(false), 3800);
    return () => window.clearTimeout(timer);
  }, [levelUp]);

  const handleSecretTap = () => {
    if (!ready || superSaiyanUnlocked || secretClaimed.current) return;
    secretTapCount.current += 1;
    if (secretTapCount.current < 7) return;
    secretClaimed.current = true;
    if (!onUnlockSuperSaiyan()) {
      secretClaimed.current = false;
      return;
    }

    updatePersisted((current) =>
      awardMission(
        current,
        SUPER_SAIYAN_MISSION.id,
        SUPER_SAIYAN_MISSION.rewardXp,
        Math.floor(SUPER_SAIYAN_MISSION.rewardXp / 10),
      ),
    );
    enqueueSuccessNotification("FORMA DORATA SBLOCCATA!", {
      description: `Patchy ha superato il limite · +${SUPER_SAIYAN_MISSION.rewardXp} XP`,
      sound: "level-up",
      duration: 5000,
    });
  };

  return {
    progression,
    bits: persisted.bits,
    equippedProfileFrameId: persisted.equippedProfileFrameId,
    levelUp,
    streakCelebration,
    handleSecretTap,
  };
}
