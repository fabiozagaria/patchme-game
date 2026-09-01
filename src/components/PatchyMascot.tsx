interface PatchyMascotProps {
  className?: string;
  decorative?: boolean;
}

/** Mascotte ufficiale di PatchMe. */
export function PatchyMascot({ className = "", decorative = false }: PatchyMascotProps) {
  return (
    <img
      src="/assets/patchy-mascot.png"
      alt={decorative ? "" : "Patchy, la mascotte di PatchMe"}
      aria-hidden={decorative || undefined}
      width={640}
      height={640}
      className={className}
      decoding="async"
    />
  );
}
