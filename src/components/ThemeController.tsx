import { useEffect } from "react";
import { useAppStore } from "@/state/app-store";

/** Applica tema (chiaro/scuro/sistema) e colore principale al documento. */
export function ThemeController() {
  const { settings, ready } = useAppStore();

  useEffect(() => {
    if (!ready || typeof document === "undefined") return;
    const root = document.documentElement;

    const apply = () => {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = settings.theme === "dark" || (settings.theme === "system" && prefersDark);
      root.classList.toggle("dark", dark);
    };

    apply();
    root.style.setProperty("--accent-brand", settings.accent);

    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ready, settings.theme, settings.accent]);

  return null;
}
