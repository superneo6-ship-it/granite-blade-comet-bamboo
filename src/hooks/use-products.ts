import { useCallback, useEffect, useState } from "react";
import {
  DATA_URL,
  parseProductsHtml,
  type Product,
} from "@/lib/products";

type CatalogState =
  | { status: "loading"; products: Product[]; error: null }
  | { status: "ready"; products: Product[]; error: null }
  | { status: "error"; products: Product[]; error: string };

const INITIAL: CatalogState = {
  status: "loading",
  products: [],
  error: null,
};

export function useProductCatalog() {
  const [state, setState] = useState<CatalogState>(INITIAL);

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Nie udało się wczytać bazy (${response.status}).`);
      }
      const html = await response.text();
      const products = parseProductsHtml(html);
      if (products.length === 0) {
        throw new Error("Plik dane.html nie zawiera żadnego towaru.");
      }
      setState({ status: "ready", products, error: null });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Nie udało się wczytać pliku dane.html.";
      setState({ status: "error", products: [], error: message });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
