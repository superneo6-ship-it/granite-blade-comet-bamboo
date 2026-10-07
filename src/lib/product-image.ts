const UA = "Alejka/1.0 (warehouse product locator)";
const cache = new Map<string, string | null>();

const STOP = new Set([
  "napoj",
  "woda",
  "plyn",
  "papier",
  "chleb",
  "tostowy",
  "rolek",
  "cytrynowy",
]);

type OffProduct = {
  product_name?: string;
  brands?: string | string[];
  image_front_url?: string;
  image_url?: string;
  image_front_small_url?: string;
  selected_images?: {
    front?: { display?: { pl?: string; en?: string } };
  };
};

function pickImage(product: OffProduct | null | undefined): string | null {
  if (!product) return null;
  const candidates = [
    product.image_front_url,
    product.image_url,
    product.selected_images?.front?.display?.pl,
    product.selected_images?.front?.display?.en,
    product.image_front_small_url,
  ];
  for (const url of candidates) {
    if (typeof url === "string" && url.startsWith("https://")) {
      return url.replace(/\.400\.(jpg|jpeg|png|webp)(\?.*)?$/i, ".full.$1$2");
    }
  }
  return null;
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokensOf(name: string): string[] {
  return fold(name)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !STOP.has(token));
}

function matchesName(product: OffProduct, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const brands = Array.isArray(product.brands)
    ? product.brands.join(" ")
    : (product.brands ?? "");
  const hay = fold(`${product.product_name ?? ""} ${brands}`);
  return tokens.some((token) => hay.includes(token));
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UA },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function byBarcode(code: string): Promise<string | null> {
  const hosts = [
    "world.openfoodfacts.org",
    "world.openproductsfacts.org",
    "world.openbeautyfacts.org",
  ];
  for (const host of hosts) {
    const data = (await getJson(
      `https://${host}/api/v2/product/${encodeURIComponent(code)}?fields=image_front_url,image_url,image_front_small_url,selected_images`,
    )) as { status?: number; product?: OffProduct } | null;
    if (data?.status === 1) {
      const image = pickImage(data.product);
      if (image) return image;
    }
  }
  return null;
}

async function byName(name: string): Promise<string | null> {
  const tokens = tokensOf(name);
  const query = tokens.join(" ") || name;
  const endpoints = [
    "https://search.openfoodfacts.org/search",
    "https://search.openproductsfacts.org/search",
  ];
  let fallback: string | null = null;
  for (const endpoint of endpoints) {
    const params = new URLSearchParams({ q: query, page_size: "8" });
    const data = (await getJson(`${endpoint}?${params.toString()}`)) as {
      hits?: OffProduct[];
    } | null;
    for (const product of data?.hits ?? []) {
      const image = pickImage(product);
      if (!image) continue;
      if (matchesName(product, tokens)) return image;
      fallback ??= image;
    }
  }
  return fallback;
}

export async function findProductImage(
  barcode: string,
  name: string,
): Promise<string | null> {
  const code = barcode.replace(/\D/g, "");
  const label = name.trim().slice(0, 80);
  const key = `v3|${code}|${label.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  let image: string | null = null;
  if (code.length >= 8) image = await byBarcode(code);
  if (!image && label.length >= 3) image = await byName(label);

  cache.set(key, image);
  return image;
}
