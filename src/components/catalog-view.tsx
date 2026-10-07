import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  numericValue,
  searchProducts,
  type Product,
} from "@/lib/products";

type Props = {
  products: Product[];
  onPick: (code: string) => void;
};

export function CatalogView({ products, onPick }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => searchProducts(query, products),
    [query, products],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const item of filtered) {
      const key = item.aisle || "—";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort(
      (a, b) => numericValue(a[0]) - numericValue(b[0]),
    );
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj nazwy, kodu, alejki…"
          className="pl-10"
          aria-label="Szukaj w bazie"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak towarów dla tego zapytania.</p>
      ) : null}

      {groups.map(([aisle, items]) => (
        <section key={aisle}>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-display text-lg tracking-tight">Alejka {aisle}</h2>
            <Badge variant="muted">{items.length}</Badge>
          </div>
          <ul className="overflow-hidden rounded-lg border border-border">
            {items.map((item, index) => (
              <li key={`${item.barcode}-${item.articleNumber}`}>
                <button
                  type="button"
                  onClick={() => onPick(item.barcode || item.articleNumber)}
                  className="flex w-full items-start justify-between gap-3 bg-card px-3 py-3 text-left transition-colors duration-150 hover:bg-secondary"
                  style={
                    index > 0
                      ? { borderTop: "1px solid var(--color-border)" }
                      : undefined
                  }
                >
                  <span>
                    <span className="block text-sm font-medium">{item.name}</span>
                    <span className="mt-0.5 block font-mono text-xs tabular-nums text-muted-foreground">
                      {item.articleNumber} · {item.barcode}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    R{item.rack} · P{item.shelf} · {item.position}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="text-xs leading-normal text-faint">
        Baza pochodzi z pliku dane.html. Dopisz wiersz w tabeli, żeby dodać towar.
      </p>
    </div>
  );
}
