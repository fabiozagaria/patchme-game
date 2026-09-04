import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppStoreProvider, useAppStore } from "@/state/app-store";
import { ThemeController } from "@/components/ThemeController";
import { SoundEffectsController } from "@/components/SoundEffectsController";
import { IntroSignature, shouldShowIntro } from "@/components/IntroSignature";
import { PatchyMascot } from "@/components/PatchyMascot";
import { UpdateNotificationController } from "@/components/UpdateNotificationController";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <PatchyMascot className="mx-auto size-40 object-contain" pose="bug" />
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Pagina non trovata</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Questa schermata non esiste o è stata spostata.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
          >
            Torna all'archivio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <PatchyMascot className="mx-auto size-40 object-contain" pose="bug" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Questa pagina non si è caricata
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Qualcosa è andato storto. Puoi riprovare o tornare all'archivio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
          >
            Riprova
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground"
          >
            Archivio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#141414" },
      { name: "author", content: "fabiozagariadev" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://patchme-fabiozagariadev.vercel.app/assets/icon-512.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://patchme-fabiozagariadev.vercel.app/assets/icon-512.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        // crossOrigin consente la lettura delle regole CSS durante l'export PNG
        crossOrigin: "anonymous",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppGate({ children }: { children: ReactNode }) {
  const { ready, settings } = useAppStore();
  const [showIntro] = useState(() => shouldShowIntro());
  const [introDone, setIntroDone] = useState(!showIntro);

  const visible = ready && (introDone || !showIntro);

  useEffect(() => {
    document.documentElement.dataset.hardcore = settings.hardcoreMode ? "true" : "false";
    return () => delete document.documentElement.dataset.hardcore;
  }, [settings.hardcoreMode]);

  return (
    <>
      {showIntro && !introDone && <IntroSignature onDone={() => setIntroDone(true)} />}
      <div className={visible ? "opacity-100 transition-opacity duration-200" : "opacity-0"}>
        {children}
      </div>
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        <ThemeController />
        <SoundEffectsController />
        <UpdateNotificationController />
        <AppGate>
          {/* Required: nested routes render here. */}
          <Outlet />
        </AppGate>
        <Toaster position="top-center" />
      </AppStoreProvider>
    </QueryClientProvider>
  );
}
