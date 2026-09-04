import { Check } from "lucide-react";
import type { ProfileAvatar } from "@/lib/patch-model";
import { PatchyMascot } from "@/components/PatchyMascot";

const AVATARS: readonly { value: ProfileAvatar; label: string }[] = [
  { value: "hello", label: "Classico" },
  { value: "thinking", label: "Pensieroso" },
  { value: "celebrate", label: "Festeggiante" },
  { value: "bug", label: "Buggato" },
  { value: "superSaiyan", label: "Forma dorata" },
];

export function AvatarPicker({
  value,
  onChange,
  unlockedAvatars = [],
}: {
  value: ProfileAvatar;
  onChange: (value: ProfileAvatar) => void;
  unlockedAvatars?: readonly ProfileAvatar[];
}) {
  const visibleAvatars = AVATARS.filter(
    (avatar) => avatar.value !== "superSaiyan" || unlockedAvatars.includes(avatar.value),
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {visibleAvatars.map((avatar) => (
        <button
          key={avatar.value}
          type="button"
          aria-label={`Avatar ${avatar.label}`}
          aria-pressed={value === avatar.value}
          onClick={() => onChange(avatar.value)}
          className={`tap-safe relative flex flex-col items-center rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
            value === avatar.value
              ? "border-brand bg-brand/10 text-foreground"
              : "border-border text-muted-foreground"
          }`}
        >
          <PatchyMascot className="size-16 object-contain" pose={avatar.value} decorative />
          {avatar.label}
          {value === avatar.value ? (
            <Check className="absolute right-2 top-2 size-4 text-brand" aria-hidden="true" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
