import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createId, createSection, type Patch } from "@/lib/patch-model";
import { suggestVersion } from "@/lib/versioning";
import { useAppStore } from "@/state/app-store";
import { PatchEditor } from "@/components/PatchEditor";
import type { GuidedAnswer } from "@/components/GuidedPatchWizard";
import { APP_CONFIG } from "@/config/app-config";
import { weeklyPromptSelectionSchema, type WeeklyPromptSelection } from "@/lib/weekly-prompt";

export const Route = createFileRoute("/patch/new")({
  head: () => ({
    meta: [
      { title: "Nuova patch — PatchMe" },
      {
        name: "description",
        content: "Crea una nuova patch note personale con sezioni ed elementi.",
      },
      { property: "og:title", content: "Nuova patch — PatchMe" },
      { property: "og:description", content: "Crea una nuova patch note personale." },
    ],
  }),
  component: NewPatchPage,
});

function NewPatchPage() {
  const { ready, settings, patches } = useAppStore();
  const [creationSeed, setCreationSeed] = useState<{
    guidedAnswers: GuidedAnswer[];
    weeklySelection: WeeklyPromptSelection | null;
  } | null>(null);

  useEffect(() => {
    try {
      const guidedAnswers = JSON.parse(
        window.sessionStorage.getItem("patchme.guided.answers") ?? "[]",
      ) as GuidedAnswer[];
      const weeklyRaw = window.sessionStorage.getItem(APP_CONFIG.storageKeys.weeklyDraft);
      const weeklyResult = weeklyRaw
        ? weeklyPromptSelectionSchema.safeParse(JSON.parse(weeklyRaw))
        : null;
      setCreationSeed({
        guidedAnswers,
        weeklySelection: weeklyResult?.success ? weeklyResult.data : null,
      });
    } catch {
      setCreationSeed({ guidedAnswers: [], weeklySelection: null });
    } finally {
      window.sessionStorage.removeItem("patchme.guided.answers");
      window.sessionStorage.removeItem(APP_CONFIG.storageKeys.weeklyDraft);
    }
  }, []);

  const draft = useMemo<Patch>(() => {
    const now = new Date().toISOString();
    const guidedSections = (creationSeed?.guidedAnswers ?? []).map((answer) => ({
      ...createSection(answer.category, answer.title),
      items: [{ id: createId(), text: answer.text }],
    }));
    const weeklySections = creationSeed?.weeklySelection
      ? [
          {
            ...createSection(
              creationSeed.weeklySelection.category,
              creationSeed.weeklySelection.sectionTitle,
            ),
            items: [{ id: createId(), text: creationSeed.weeklySelection.answer }],
          },
        ]
      : [];
    return {
      id: createId(),
      title: creationSeed?.weeklySelection
        ? `Patch settimanale · ${creationSeed.weeklySelection.weekLabel}`
        : "",
      version: suggestVersion(settings.versionFormat, patches),
      date: now,
      status: "draft",
      sections: weeklySections.length
        ? weeklySections
        : guidedSections.length
          ? guidedSections
          : [createSection("news", "Novità")],
      createdAt: now,
      updatedAt: now,
    };
  }, [creationSeed, patches, settings.versionFormat]);

  if (!ready || creationSeed === null) return <div className="min-h-screen bg-background" />;
  if (!settings.onboarded) return <Navigate to="/" />;

  return <PatchEditor initialPatch={draft} isNew />;
}
