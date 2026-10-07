export type Product = {
  barcode: string;
  name: string;
  articleNumber: string;
  aisle: string;
  rack: string;
  shelf: string;
  position: string;
};

export const DATA_URL = "/dane.html";

const HEADER_ALIASES: Record<string, keyof Product> = {
  "kod kreskowy": "barcode",
  kod: "barcode",
  ean: "barcode",
  ean13: "barcode",
  barcode: "barcode",
  nazwa: "name",
  "nazwa artykulu": "name",
  "nazwa artykułu": "name",
  towar: "name",
  "numer artykulu": "articleNumber",
  "numer artykułu": "articleNumber",
  "nr artykulu": "articleNumber",
  "nr artykułu": "articleNumber",
  artykul: "articleNumber",
  artykuł: "articleNumber",
  sku: "articleNumber",
  alejka: "aisle",
  aisle: "aisle",
  regal: "rack",
  regał: "rack",
  rack: "rack",
  polka: "shelf",
  półka: "shelf",
  shelf: "shelf",
  pozycja: "position",
  "pozycja od lewej": "position",
  "od lewej": "position",
  position: "position",
};

const FIELD_ORDER: Array<keyof Product> = [
  "barcode",
  "name",
  "articleNumber",
  "aisle",
  "rack",
  "shelf",
  "position",
];

export function normalizeCode(value: string): string {
  return value.replace(/[\s-]/g, "").trim();
}

function stripTags(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function foldHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTable(html: string): string | null {
  const marked = html.match(
    /<table[^>]*id=["']towary["'][^>]*>([\s\S]*?)<\/table>/i,
  );
  if (marked) return marked[1] ?? null;
  const any = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  return any ? (any[1] ?? null) : null;
}

function cellsInRow(rowHtml: string): string[] {
  const cells: string[] = [];
  const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rowHtml))) {
    cells.push(stripTags(match[1] ?? ""));
  }
  return cells;
}

function mapHeaders(cells: string[]): Array<keyof Product | null> | null {
  const mapped = cells.map((cell) => HEADER_ALIASES[foldHeader(cell)] ?? null);
  const known = mapped.filter(Boolean).length;
  if (known >= 3) return mapped;
  return null;
}

function productFromCells(
  cells: string[],
  columns: Array<keyof Product | null> | null,
): Product | null {
  const product: Product = {
    barcode: "",
    name: "",
    articleNumber: "",
    aisle: "",
    rack: "",
    shelf: "",
    position: "",
  };

  if (columns) {
    cells.forEach((value, index) => {
      const key = columns[index];
      if (key) product[key] = value;
    });
  } else {
    FIELD_ORDER.forEach((key, index) => {
      product[key] = cells[index] ?? "";
    });
  }

  if (!product.barcode && !product.articleNumber) return null;
  if (!product.name && !product.barcode) return null;
  return product;
}

export function parseProductsHtml(html: string): Product[] {
  const body = extractTable(html);
  if (!body) return [];

  const rows: string[] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(body))) {
    rows.push(rowMatch[1] ?? "");
  }

  if (rows.length === 0) return [];

  const firstCells = cellsInRow(rows[0] ?? "");
  const columns = mapHeaders(firstCells);
  const start = columns ? 1 : 0;
  const products: Product[] = [];

  for (let i = start; i < rows.length; i += 1) {
    const cells = cellsInRow(rows[i] ?? "");
    if (cells.every((cell) => cell.length === 0)) continue;
    const product = productFromCells(cells, columns);
    if (product) products.push(product);
  }

  return products;
}

export function findProduct(
  query: string,
  products: Product[],
): Product | undefined {
  const needle = normalizeCode(query);
  if (!needle) return undefined;
  return products.find(
    (item) =>
      normalizeCode(item.barcode) === needle ||
      normalizeCode(item.articleNumber) === needle,
  );
}

export function searchProducts(
  query: string,
  products: Product[],
): Product[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return products;
  const needle = normalizeCode(raw).toLowerCase();
  return products.filter((item) => {
    const hay = [
      item.name,
      item.barcode,
      item.articleNumber,
      item.aisle,
      `alejka ${item.aisle}`,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(raw) || normalizeCode(hay).includes(needle);
  });
}

export function numericValue(value: string): number {
  const n = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function locationBounds(products: Product[], current: Product) {
  const aisle = Math.max(1, numericValue(current.aisle));
  const rack = Math.max(1, numericValue(current.rack));
  const shelf = Math.max(1, numericValue(current.shelf));
  const position = Math.max(1, numericValue(current.position));

  const maxAisle = Math.max(
    5,
    aisle,
    ...products.map((p) => numericValue(p.aisle)),
  );
  const sameRack = products.filter(
    (p) =>
      numericValue(p.aisle) === aisle && numericValue(p.rack) === rack,
  );
  const maxShelf = Math.max(
    4,
    shelf,
    ...sameRack.map((p) => numericValue(p.shelf)),
  );
  const sameShelf = sameRack.filter((p) => numericValue(p.shelf) === shelf);
  const maxPosition = Math.max(
    8,
    position,
    ...sameShelf.map((p) => numericValue(p.position)),
  );

  return { aisle, rack, shelf, position, maxAisle, maxShelf, maxPosition };
}

export function locationLine(product: Product): string {
  return `Alejka ${product.aisle}, regał ${product.rack}, półka ${product.shelf}, ${product.position}. od lewej`;
}

export function locationSpeech(product: Product): string {
  return `Idź do alejki ${product.aisle}. Szukaj regału ${product.rack}. Półka ${product.shelf} od dołu, ${product.position}. towar od lewej.`;
}

export function copyCard(product: Product): string {
  return [
    product.name,
    `Nr artykułu ${product.articleNumber}`,
    `Kod ${product.barcode}`,
    locationLine(product),
  ].join("\n");
}
