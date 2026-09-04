import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  createId,
  createSection,
  type Patch,
  type PatchSubject,
  type PatchTone,
  type ShareTemplate,
} from "@/lib/patch-model";
import { suggestVersion } from "@/lib/versioning";
import { useAppStore } from "@/state/app-store";
import { PatchEditor } from "@/components/PatchEditor";
import type { GuidedAnswer } from "@/components/GuidedPatchWizard";
import { APP_CONFIG } from "@/config/app-config";
import { weeklyPromptSelectionSchema, type WeeklyPromptSelection } from "@/lib/weekly-prompt";
import { ProductTour } from "@/components/ProductTour";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export const Route = createFileRoute("/patch/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    counter: search.counter === true || search.counter === "1" || search.counter === "true",
    subject: (["self", "friend", "group", "situation"] as const).includes(
      search.subject as PatchSubject,
    )
      ? (search.subject as PatchSubject)
      : "self",
    target: typeof search.target === "string" ? search.target.slice(0, 50) : "",
    tone: (["light", "sarcastic", "hardcore"] as const).includes(search.tone as PatchTone)
      ? (search.tone as PatchTone)
      : "light",
    template: (["classic", "terminal", "rpg", "chaos"] as const).includes(
      search.template as ShareTemplate,
    )
      ? (search.template as ShareTemplate)
      : "classic",
  }),
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
  const counterSeed = Route.useSearch();
  const { ready, settings, patches, saveSettings } = useAppStore();
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

  useEffect(() => {
    if (!counterSeed.counter || settings.shareTemplate === counterSeed.template) return;
    saveSettings({ ...settings, shareTemplate: counterSeed.template });
  }, [counterSeed.counter, counterSeed.template, saveSettings, settings]);

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
      subject: counterSeed.subject,
      targetName: counterSeed.target,
      tone: counterSeed.tone,
      sections: weeklySections.length
        ? weeklySections
        : guidedSections.length
          ? guidedSections
          : [createSection("news", "Novità")],
      createdAt: now,
      updatedAt: now,
    };
  }, [counterSeed, creationSeed, patches, settings.versionFormat]);

  if (!ready || creationSeed === null) return <div className="min-h-screen bg-background" />;
  if (!settings.productTourSeen) {
    return <ProductTour onDone={() => saveSettings({ ...settings, productTourSeen: true })} />;
  }
  if (!settings.onboarded) {
    return (
      <OnboardingWizard
        onComplete={(nextSettings) => saveSettings({ ...nextSettings, productTourSeen: true })}
      />
    );
  }

  return <PatchEditor initialPatch={draft} isNew counterPatch={counterSeed.counter} />;
}
