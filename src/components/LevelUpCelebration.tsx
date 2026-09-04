import { Sparkles, Zap } from "lucide-react";

const SHARDS = Array.from({ length: 10 }, (_, index) => index);

export function LevelUpCelebration({ level, title }: { level: number; title: string }) {
  return (
    <div
      className="level-up-overlay absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-[inherit] bg-background/92 p-4 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      {SHARDS.map((shard) => (
        <span
          key={shard}
          className="level-up-shard absolute left-1/2 top-1/2 h-12 w-1 rounded-full bg-brand"
          style={{ "--shard": shard } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}
      <div className="relative z-10">
        <div className="level-up-emblem mx-auto flex size-28 items-center justify-center rounded-3xl border-2 border-brand bg-surface shadow-[0_0_45px_color-mix(in_oklab,var(--brand)_45%,transparent)]">
          <span className="display text-6xl font-black text-brand">{level}</span>
        </div>
        <div className="level-up-copy mt-4">
          <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-brand">
            <Zap className="size-4" /> Level up <Sparkles className="size-4" />
          </p>
          <p className="display mt-1 text-3xl font-black uppercase text-foreground">Nuovo titolo</p>
          <p className="mt-1 max-w-xs text-sm font-bold text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}
