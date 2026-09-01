import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { APP_CONFIG } from "@/config/app-config";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: "/" | "/settings";
  onBack?: () => void;
  action?: ReactNode;
}

export function AppHeader({ title, subtitle, backTo, onBack, action }: AppHeaderProps) {
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
        {action}
      </div>
    </header>
  );
}
