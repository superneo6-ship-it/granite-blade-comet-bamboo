import { useState } from "react";
import { Check, Copy, ScanLine } from "lucide-react";
import { ProductPhoto } from "@/components/product-photo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  copyCard,
  locationSpeech,
  type Product,
} from "@/lib/products";

type Props = {
  product: Product | null;
  query: string;
  photoUrl?: string | null;
  onScanAgain: () => void;
};

export function ProductResult({
  product,
  query,
  photoUrl,
  onScanAgain,
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!query) return null;

  if (!product) {
    return (
      <section className="stagger-in rounded-xl border border-border bg-card p-4 shadow-ticket">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Brak w bazie
        </p>
        <h2 className="mt-1 font-display text-3xl leading-tight tracking-tight">
          Nie znaleziono towaru
        </h2>
        <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
          {query}
        </p>
        <p className="mt-3 text-sm leading-normal text-muted-foreground">
          Sprawdź, czy kod jest w pliku dane.html, albo wpisz numer artykułu.
        </p>
        <Button
          className="mt-4 w-full"
          variant="secondary"
          onClick={onScanAgain}
        >
          <ScanLine />
          Skanuj ponownie
        </Button>
      </section>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyCard(product));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="stagger-in rounded-xl border border-border bg-card p-4 shadow-ticket">
      <ProductPhoto
        barcode={product.barcode}
        name={product.name}
        url={photoUrl}
        className="h-56 w-full sm:h-64"
      />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Towar
          </p>
          <h2 className="mt-0.5 font-display text-3xl leading-none tracking-tight">
            {product.name}
          </h2>
        </div>
        <Badge variant="default">W bazie</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Meta label="Alejka" value={product.aisle} />
        <Meta label="Regał" value={product.rack} />
        <Meta label="Półka" value={product.shelf} />
        <Meta label="Od lewej" value={product.position} />
      </div>

      <p className="mt-3 text-sm leading-normal text-muted-foreground">
        {locationSpeech(product)}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Meta label="Numer artykułu" value={product.articleNumber} mono />
        <Meta label="Kod kreskowy" value={product.barcode} mono />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Skopiowano" : "Kopiuj"}
        </Button>
        <Button onClick={onScanAgain}>
          <ScanLine />
          Kolejny
        </Button>
      </div>
    </section>
  );
}

function Meta({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md bg-secondary px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-0.5 break-all font-mono text-sm tabular-nums"
            : "mt-0.5 font-display text-2xl leading-none tracking-tight"
        }
      >
        {value}
      </p>
    </div>
  );
}
