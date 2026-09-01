interface PatchyMascotProps {
  className?: string;
  decorative?: boolean;
  pose?: PatchyPose;
}

export type PatchyPose = "hello" | "thinking" | "celebrate" | "bug";

const POSES: Record<PatchyPose, { src: string; alt: string }> = {
  hello: {
    src: "/assets/patchy-mascot.png",
    alt: "Patchy saluta",
  },
  thinking: {
    src: "/assets/patchy-thinking.png",
    alt: "Patchy sta pensando",
  },
  celebrate: {
    src: "/assets/patchy-celebrate.png",
    alt: "Patchy festeggia",
  },
  bug: {
    src: "/assets/patchy-bug.png",
    alt: "Patchy ha trovato un bug",
  },
};

/** Mascotte ufficiale di PatchMe. */
export function PatchyMascot({
  className = "",
  decorative = false,
  pose = "hello",
}: PatchyMascotProps) {
  const selectedPose = POSES[pose];

  return (
    <img
      src={selectedPose.src}
      alt={decorative ? "" : selectedPose.alt}
      aria-hidden={decorative || undefined}
      width={640}
      height={640}
      className={className}
      decoding="async"
    />
  );
}
