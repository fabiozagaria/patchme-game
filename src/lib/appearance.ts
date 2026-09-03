import type { ThemeMode } from "@/lib/patch-model";

export function applyAppearance(theme: ThemeMode, accent: string) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
  root.style.setProperty("--accent-brand", accent);
}
