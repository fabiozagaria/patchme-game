import type { ProfileAvatar } from "@/lib/patch-model";
import { PatchyMascot } from "@/components/PatchyMascot";

export function ProfileAppearancePreview({
  avatar,
  username,
}: {
  avatar: ProfileAvatar;
  username: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/10 p-3">
      <PatchyMascot pose={avatar} className="size-14 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Anteprima profilo
        </p>
        <p className="truncate font-bold text-foreground">@{username.trim() || "username"}</p>
        <p className="text-xs text-muted-foreground">
          Tema e colore cambiano subito. Gestisci gli avatar dal Profilo.
        </p>
      </div>
    </div>
  );
}
