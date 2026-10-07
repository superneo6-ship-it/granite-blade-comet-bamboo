import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  List,
  RefreshCw,
  ScanBarcode,
  ScanLine,
} from "lucide-react";
import { CatalogView } from "@/components/catalog-view";
import { ProductResult } from "@/components/product-result";
import { ScannerOverlay } from "@/components/scanner-overlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductCatalog } from "@/hooks/use-products";
import { findProduct, normalizeCode } from "@/lib/products";
import { loadRecent, pushRecent, type RecentItem } from "@/lib/recent";
import { signalFound, signalMiss } from "@/lib/signal";
import { cn } from "@/lib/utils";

const EXAMPLE_CODE = "5901861002712";

type AppSearch = {
  kod?: string;
  widok?: "skaner" | "baza";
};

function parseSearch(raw: Record<string, unknown>): AppSearch {
  const kodRaw = raw.kod;
  let kod: string | undefined;
  if (typeof kodRaw === "string" && kodRaw.length > 0) {
    kod = kodRaw;
  } else if (typeof kodRaw === "number" && Number.isFinite(kodRaw)) {
    kod = String(kodRaw);
  }
  return {
    kod,
    widok: raw.widok === "baza" ? "baza" : "skaner",
  };
}

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  loaderDeps: ({ search }) => ({ kod: search.kod }),
  loader: async ({ deps }) => {
    const kod = deps.kod;
    if (!kod) return { photoUrl: null as string | null };
    try {
      const { findProductImage } = await import("@/lib/product-image");
      const photoUrl = await findProductImage(kod, "");
      return { photoUrl };
    } catch {
      return { photoUrl: null as string | null };
    }
  },
  component: Home,
});

function Home() {
  const { kod, widok } = Route.useSearch();
  const { photoUrl } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const catalog = useProductCatalog();
  const [draft, setDraft] = useState(kod ?? "");
  const [scanning, setScanning] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const signaled = useRef<string>("");

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    setDraft(kod ?? "");
  }, [kod]);

  const product = kod ? (findProduct(kod, catalog.products) ?? null) : null;
  const lookedUp = Boolean(kod) && catalog.status === "ready";

  useEffect(() => {
    if (!lookedUp || !kod) return;
    if (signaled.current === kod) return;
    signaled.current = kod;
    const found = findProduct(kod, catalog.products);
    if (found) {
      signalFound();
      setRecent(
        pushRecent({
          code: found.barcode || found.articleNumber,
          name: found.name,
        }),
      );
    } else {
      signalMiss();
    }
  }, [lookedUp, kod, catalog.products]);

  const go = (next: AppSearch) => {
    void navigate({ to: "/", search: next });
  };

  const lookup = (raw: string) => {
    const code = normalizeCode(raw);
    if (!code) return;
    setScanning(false);
    go({ kod: code, widok: "skaner" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <header className="flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <p className="font-display text-3xl leading-none tracking-tight">Alejka</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Skaner lokalizacji towaru
          </p>
        </div>
        <div className="flex items-center gap-2">
          {catalog.status === "ready" ? (
            <Badge variant="muted">{catalog.products.length} szt.</Badge>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void catalog.reload()}
            aria-label="Odśwież bazę towarów"
          >
            <RefreshCw className={cn(catalog.status === "loading" && "animate-spin")} />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28">
        {widok === "baza" ? (
          catalog.status === "error" ? (
            <ErrorState message={catalog.error} onRetry={() => void catalog.reload()} />
          ) : catalog.status === "loading" ? (
            <p className="text-sm text-muted-foreground">Wczytuję bazę…</p>
          ) : (
            <CatalogView
              products={catalog.products}
              onPick={(code) => lookup(code)}
            />
          )
        ) : (
          <div className="space-y-4">
            {lookedUp ? (
              <>
                <ProductResult
                  product={product}
                  query={kod ?? ""}
                  photoUrl={photoUrl}
                  onScanAgain={() => setScanning(true)}
                />
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    lookup(draft);
                  }}
                >
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="search"
                    placeholder="Inny kod lub nr artykułu"
                    aria-label="Kod kreskowy lub numer artykułu"
                  />
                  <Button type="submit" variant="secondary">
                    Szukaj
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full font-display text-xl tracking-tight"
                  onClick={() => setScanning(true)}
                >
                  <ScanLine className="size-5" />
                  Skanuj kod kreskowy
                </Button>

                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    lookup(draft);
                  }}
                >
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="search"
                    placeholder="Wpisz kod lub nr artykułu"
                    aria-label="Kod kreskowy lub numer artykułu"
                  />
                  <Button type="submit" variant="secondary">
                    Szukaj
                  </Button>
                </form>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => lookup(EXAMPLE_CODE)}
                    className="rounded-sm border border-border bg-secondary px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    Przykład: {EXAMPLE_CODE}
                  </button>
                </div>

                {catalog.status === "error" ? (
                  <ErrorState message={catalog.error} onRetry={() => void catalog.reload()} />
                ) : catalog.status === "loading" ? (
                  <p className="text-sm text-muted-foreground">Wczytuję bazę…</p>
                ) : (
                  <EmptyHint />
                )}
              </>
            )}

            {recent.length > 0 && !lookedUp ? (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Ostatnie skany
                </h2>
                <ul className="overflow-hidden rounded-lg border border-border">
                  {recent.map((item, index) => (
                    <li key={`${item.code}-${item.at}`}>
                      <button
                        type="button"
                        onClick={() => lookup(item.code)}
                        className="flex w-full items-center justify-between gap-3 bg-card px-3 py-3 text-left hover:bg-secondary"
                        style={
                          index > 0
                            ? { borderTop: "1px solid var(--color-border)" }
                            : undefined
                        }
                      >
                        <span className="truncate text-sm">{item.name}</span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {item.code}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto grid max-w-lg grid-cols-2 p-2">
          <TabButton
            active={widok !== "baza"}
            onClick={() => go({ kod, widok: "skaner" })}
            icon={<ScanBarcode />}
            label="Skaner"
          />
          <TabButton
            active={widok === "baza"}
            onClick={() => go({ kod, widok: "baza" })}
            icon={<List />}
            label="Baza"
          />
        </div>
      </nav>

      <ScannerOverlay
        open={scanning}
        onClose={() => setScanning(false)}
        onDetect={(code) => lookup(code)}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="[&_svg]:size-4">{icon}</span>
      {label}
    </button>
  );
}

function EmptyHint() {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-8 text-center">
      <ScanBarcode className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-display text-2xl tracking-tight">Gotowy do skanu</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-normal text-muted-foreground">
        Zeskanuj kod aparatem albo wpisz numer. Po odczycie zobaczysz alejkę,
        regał, półkę i pozycję od lewej.
      </p>
    </section>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm leading-normal text-muted-foreground">{message}</p>
      <Button className="mt-4" variant="secondary" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </section>
  );
}
