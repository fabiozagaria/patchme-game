import { useAppStore } from "@/state/app-store";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { APP_CONFIG } from "@/config/app-config";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: "/" | "/settings";
  onBack?: () => void;
  action?: ReactNode;
}

export function AppHeader({ title, subtitle, backTo, onBack, action }: AppHeaderProps) {
  const { settings, ready, saveSettings } = useAppStore();
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const dark = settings.theme === "dark" || (settings.theme === "system" && systemDark);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Indietro"
            className="tap-safe -ml-2 flex w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : backTo ? (
          <Link
            to={backTo}
            aria-label="Indietro"
            className="tap-safe -ml-2 flex w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          <span className="display text-lg font-extrabold uppercase tracking-tight text-brand">
            {APP_CONFIG.name}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          type="button"
          disabled={!ready}
          aria-pressed={dark}
          aria-label={dark ? "Attiva tema chiaro" : "Attiva tema scuro"}
          title={dark ? "Attiva tema chiaro" : "Attiva tema scuro"}
          onClick={() => saveSettings({ ...settings, theme: dark ? "light" : "dark" })}
          className="tap-safe flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-brand"
        >
          {dark ? (
            <Sun className="size-5" aria-hidden="true" />
          ) : (
            <Moon className="size-5" aria-hidden="true" />
          )}
        </button>
        {action}
      </div>
    </header>
  );
}
