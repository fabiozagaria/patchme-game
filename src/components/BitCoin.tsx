import { cn } from "@/lib/utils";

export function BitCoin({
  className,
  decorative = true,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span
      className={cn("bit-coin inline-flex shrink-0 items-center justify-center", className)}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Bit"}
    >
      <span className="bit-coin-mark">B</span>
    </span>
  );
}
