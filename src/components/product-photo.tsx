import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  barcode: string;
  name: string;
  url?: string | null;
  className?: string;
};

export function ProductPhoto({ barcode, name, url, className }: Props) {
  const [src, setSrc] = useState<string | null>(url ?? null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">(
    url ? "ready" : "loading",
  );

  useEffect(() => {
    let cancelled = false;
    if (url) {
      setSrc(url);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    setSrc(null);
    const params = new URLSearchParams({ kod: barcode, nazwa: name });
    fetch(`/api/zdjecie?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) return { url: null };
        return (await response.json()) as { url?: string | null };
      })
      .then((data) => {
        if (cancelled) return;
        const next = typeof data.url === "string" ? data.url : null;
        setSrc(next);
        setStatus(next ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setStatus("empty");
      });
    return () => {
      cancelled = true;
    };
  }, [barcode, name, url]);

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className,
      )}
    >
      {status === "loading" ? (
        <div className="h-24 w-24 animate-pulse rounded-md bg-border" />
      ) : src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-contain p-4"
          referrerPolicy="no-referrer"
          onError={() => setStatus("empty")}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="size-10" />
          <p className="text-xs">Brak zdjęcia w sieci</p>
        </div>
      )}
    </div>
  );
}
