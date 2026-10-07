import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as require_react_dom, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ScanBarcode, c as List, d as Copy, f as Check, i as ScanLine, l as Flashlight, o as RefreshCw, r as Search, s as Package, t as X, u as FlashlightOff } from "../_libs/lucide-react.mjs";
import { n as Route$1 } from "./router-Cb6DSh-5.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DvCbfPDt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		outline: "border-border text-muted-foreground",
		muted: "border-transparent bg-secondary text-muted-foreground"
	} },
	defaultVariants: { variant: "outline" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-input bg-secondary px-3 py-2 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var DATA_URL = "/dane.html";
var HEADER_ALIASES = {
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
	position: "position"
};
var FIELD_ORDER = [
	"barcode",
	"name",
	"articleNumber",
	"aisle",
	"rack",
	"shelf",
	"position"
];
function normalizeCode(value) {
	return value.replace(/[\s-]/g, "").trim();
}
function stripTags(raw) {
	return raw.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&/gi, "&").replace(/</gi, "<").replace(/>/gi, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
}
function foldHeader(value) {
	return value.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function extractTable(html) {
	const marked = html.match(/<table[^>]*id=["']towary["'][^>]*>([\s\S]*?)<\/table>/i);
	if (marked) return marked[1] ?? null;
	const any = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
	return any ? any[1] ?? null : null;
}
function cellsInRow(rowHtml) {
	const cells = [];
	const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
	let match;
	while (match = re.exec(rowHtml)) cells.push(stripTags(match[1] ?? ""));
	return cells;
}
function mapHeaders(cells) {
	const mapped = cells.map((cell) => HEADER_ALIASES[foldHeader(cell)] ?? null);
	if (mapped.filter(Boolean).length >= 3) return mapped;
	return null;
}
function productFromCells(cells, columns) {
	const product = {
		barcode: "",
		name: "",
		articleNumber: "",
		aisle: "",
		rack: "",
		shelf: "",
		position: ""
	};
	if (columns) cells.forEach((value, index) => {
		const key = columns[index];
		if (key) product[key] = value;
	});
	else FIELD_ORDER.forEach((key, index) => {
		product[key] = cells[index] ?? "";
	});
	if (!product.barcode && !product.articleNumber) return null;
	if (!product.name && !product.barcode) return null;
	return product;
}
function parseProductsHtml(html) {
	const body = extractTable(html);
	if (!body) return [];
	const rows = [];
	const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
	let rowMatch;
	while (rowMatch = rowRe.exec(body)) rows.push(rowMatch[1] ?? "");
	if (rows.length === 0) return [];
	const columns = mapHeaders(cellsInRow(rows[0] ?? ""));
	const start = columns ? 1 : 0;
	const products = [];
	for (let i = start; i < rows.length; i += 1) {
		const cells = cellsInRow(rows[i] ?? "");
		if (cells.every((cell) => cell.length === 0)) continue;
		const product = productFromCells(cells, columns);
		if (product) products.push(product);
	}
	return products;
}
function findProduct(query, products) {
	const needle = normalizeCode(query);
	if (!needle) return void 0;
	return products.find((item) => normalizeCode(item.barcode) === needle || normalizeCode(item.articleNumber) === needle);
}
function searchProducts(query, products) {
	const raw = query.trim().toLowerCase();
	if (!raw) return products;
	const needle = normalizeCode(raw).toLowerCase();
	return products.filter((item) => {
		const hay = [
			item.name,
			item.barcode,
			item.articleNumber,
			item.aisle,
			`alejka ${item.aisle}`
		].join(" ").toLowerCase();
		return hay.includes(raw) || normalizeCode(hay).includes(needle);
	});
}
function numericValue(value) {
	const n = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
	return Number.isFinite(n) ? n : 0;
}
function locationLine(product) {
	return `Alejka ${product.aisle}, regał ${product.rack}, półka ${product.shelf}, ${product.position}. od lewej`;
}
function locationSpeech(product) {
	return `Idź do alejki ${product.aisle}. Szukaj regału ${product.rack}. Półka ${product.shelf} od dołu, ${product.position}. towar od lewej.`;
}
function copyCard(product) {
	return [
		product.name,
		`Nr artykułu ${product.articleNumber}`,
		`Kod ${product.barcode}`,
		locationLine(product)
	].join("\n");
}
function CatalogView({ products, onPick }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => searchProducts(query, products), [query, products]);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of filtered) {
			const key = item.aisle || "—";
			const list = map.get(key) ?? [];
			list.push(item);
			map.set(key, list);
		}
		return [...map.entries()].sort((a, b) => numericValue(a[0]) - numericValue(b[0]));
	}, [filtered]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Szukaj nazwy, kodu, alejki…",
					className: "pl-10",
					"aria-label": "Szukaj w bazie"
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Brak towarów dla tego zapytania."
			}) : null,
			groups.map(([aisle, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg tracking-tight",
					children: ["Alejka ", aisle]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "muted",
					children: items.length
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-lg border border-border",
				children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onPick(item.barcode || item.articleNumber),
					className: "flex w-full items-start justify-between gap-3 bg-card px-3 py-3 text-left transition-colors duration-150 hover:bg-secondary",
					style: index > 0 ? { borderTop: "1px solid var(--color-border)" } : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 block font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							item.articleNumber,
							" · ",
							item.barcode
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							"R",
							item.rack,
							" · P",
							item.shelf,
							" · ",
							item.position
						]
					})]
				}) }, `${item.barcode}-${item.articleNumber}`))
			})] }, aisle)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-normal text-faint",
				children: "Baza pochodzi z pliku dane.html. Dopisz wiersz w tabeli, żeby dodać towar."
			})
		]
	});
}
function ProductPhoto({ barcode, name, url, className }) {
	const [src, setSrc] = (0, import_react.useState)(url ?? null);
	const [status, setStatus] = (0, import_react.useState)(url ? "ready" : "loading");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (url) {
			setSrc(url);
			setStatus("ready");
			return;
		}
		setStatus("loading");
		setSrc(null);
		const params = new URLSearchParams({
			kod: barcode,
			nazwa: name
		});
		fetch(`/api/zdjecie?${params.toString()}`).then(async (response) => {
			if (!response.ok) return { url: null };
			return await response.json();
		}).then((data) => {
			if (cancelled) return;
			const next = typeof data.url === "string" ? data.url : null;
			setSrc(next);
			setStatus(next ? "ready" : "empty");
		}).catch(() => {
			if (!cancelled) setStatus("empty");
		});
		return () => {
			cancelled = true;
		};
	}, [
		barcode,
		name,
		url
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center justify-center overflow-hidden rounded-lg bg-secondary", className),
		children: status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 w-24 animate-pulse rounded-md bg-border" }) : src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: name,
			className: "h-full w-full object-contain p-4",
			referrerPolicy: "no-referrer",
			onError: () => setStatus("empty")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2 text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs",
				children: "Brak zdjęcia w sieci"
			})]
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-border",
			outline: "border border-border bg-transparent hover:bg-secondary",
			ghost: "hover:bg-secondary",
			destructive: "bg-destructive text-destructive-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-14 rounded-lg px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function ProductResult({ product, query, photoUrl, onScanAgain }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	if (!query) return null;
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "stagger-in rounded-xl border border-border bg-card p-4 shadow-ticket",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
				children: "Brak w bazie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-3xl leading-tight tracking-tight",
				children: "Nie znaleziono towaru"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-sm tabular-nums text-muted-foreground",
				children: query
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-normal text-muted-foreground",
				children: "Sprawdź, czy kod jest w pliku dane.html, albo wpisz numer artykułu."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4 w-full",
				variant: "secondary",
				onClick: onScanAgain,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {}), "Skanuj ponownie"]
			})
		]
	});
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(copyCard(product));
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "stagger-in rounded-xl border border-border bg-card p-4 shadow-ticket",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductPhoto, {
				barcode: product.barcode,
				name: product.name,
				url: photoUrl,
				className: "h-56 w-full sm:h-64"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: "Towar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-0.5 font-display text-3xl leading-none tracking-tight",
					children: product.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					children: "W bazie"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Alejka",
						value: product.aisle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Regał",
						value: product.rack
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Półka",
						value: product.shelf
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Od lewej",
						value: product.position
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-normal text-muted-foreground",
				children: locationSpeech(product)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Numer artykułu",
					value: product.articleNumber,
					mono: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: "Kod kreskowy",
					value: product.barcode,
					mono: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => void copy(),
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), copied ? "Skopiowano" : "Kopiuj"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onScanAgain,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {}), "Kolejny"]
				})]
			})
		]
	});
}
function Meta({ label, value, mono = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-secondary px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: mono ? "mt-0.5 break-all font-mono text-sm tabular-nums" : "mt-0.5 font-display text-2xl leading-none tracking-tight",
			children: value
		})]
	});
}
var READER_ID = "alejka-reader";
function ScannerOverlay({ open, onClose, onDetect }) {
	const [error, setError] = (0, import_react.useState)(null);
	const [torchOn, setTorchOn] = (0, import_react.useState)(false);
	const [torchAvailable, setTorchAvailable] = (0, import_react.useState)(false);
	const onDetectRef = (0, import_react.useRef)(onDetect);
	const locked = (0, import_react.useRef)(false);
	onDetectRef.current = onDetect;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		locked.current = false;
		let cancelled = false;
		let scanner = null;
		const start = async () => {
			setError(null);
			setTorchOn(false);
			setTorchAvailable(false);
			try {
				const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("../_libs/html5-qrcode.mjs").then((n) => n.t);
				if (cancelled) return;
				const instance = new Html5Qrcode(READER_ID, {
					verbose: false,
					formatsToSupport: [
						Html5QrcodeSupportedFormats.EAN_13,
						Html5QrcodeSupportedFormats.EAN_8,
						Html5QrcodeSupportedFormats.UPC_A,
						Html5QrcodeSupportedFormats.UPC_E,
						Html5QrcodeSupportedFormats.CODE_128,
						Html5QrcodeSupportedFormats.CODE_39,
						Html5QrcodeSupportedFormats.ITF,
						Html5QrcodeSupportedFormats.QR_CODE
					],
					useBarCodeDetectorIfSupported: true
				});
				scanner = instance;
				await instance.start({ facingMode: "environment" }, {
					fps: 12,
					aspectRatio: 1.777,
					disableFlip: true
				}, (decoded) => {
					const code = decoded.trim();
					if (!code || locked.current) return;
					locked.current = true;
					onDetectRef.current(code);
				}, () => {});
				if (cancelled) return;
				try {
					const caps = instance.getRunningTrackCapabilities();
					setTorchAvailable(Boolean(caps.torch));
				} catch {
					setTorchAvailable(false);
				}
			} catch (err) {
				if (cancelled) return;
				const name = err instanceof Error ? err.name : "";
				if (name === "NotAllowedError") setError("Brak zgody na aparat. Wpisz kod ręcznie albo zezwól na kamerę w ustawieniach przeglądarki.");
				else if (name === "NotFoundError") setError("Nie znaleziono kamery. Wpisz kod ręcznie.");
				else setError("Nie udało się uruchomić skanera. Na telefonie otwórz aplikację i zezwól na aparat — albo wpisz kod.");
			}
		};
		start();
		return () => {
			cancelled = true;
			const current = scanner;
			if (!current) return;
			(current.isScanning ? current.stop().then(() => current.clear()) : Promise.resolve(current.clear())).catch(() => {
				try {
					current.clear();
				} catch {}
			});
		};
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open || typeof document === "undefined") return null;
	const toggleTorch = async () => {
		const stream = document.querySelector(`#${READER_ID} video`)?.srcObject;
		if (!(stream instanceof MediaStream)) return;
		const track = stream.getVideoTracks()[0];
		if (!track) return;
		const next = !torchOn;
		try {
			await track.applyConstraints({ advanced: [{ torch: next }] });
			setTorchOn(next);
		} catch {
			setTorchAvailable(false);
		}
	};
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scan-overlay",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Skaner kodu kreskowego",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl tracking-tight",
					children: "Skanowanie"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "icon",
					onClick: onClose,
					"aria-label": "Zamknij skaner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scan-stage",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: READER_ID,
						className: "h-full w-full"
					}),
					!error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "viewfinder",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "viewfinder-frame",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "laser" })
						})
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-end bg-background/80 p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-prose text-sm leading-normal text-foreground",
							children: error
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Skieruj aparat na kod kreskowy"
				}), torchAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					onClick: () => void toggleTorch(),
					"aria-label": torchOn ? "Wyłącz latarkę" : "Włącz latarkę",
					children: torchOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlashlightOff, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flashlight, {})
				}) : null]
			})
		]
	}), document.body);
}
var INITIAL = {
	status: "loading",
	products: [],
	error: null
};
function useProductCatalog() {
	const [state, setState] = (0, import_react.useState)(INITIAL);
	const reload = (0, import_react.useCallback)(async () => {
		setState((prev) => ({
			...prev,
			status: "loading",
			error: null
		}));
		try {
			const response = await fetch(DATA_URL, { cache: "no-store" });
			if (!response.ok) throw new Error(`Nie udało się wczytać bazy (${response.status}).`);
			const products = parseProductsHtml(await response.text());
			if (products.length === 0) throw new Error("Plik dane.html nie zawiera żadnego towaru.");
			setState({
				status: "ready",
				products,
				error: null
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Nie udało się wczytać pliku dane.html.";
			setState({
				status: "error",
				products: [],
				error: message
			});
		}
	}, []);
	(0, import_react.useEffect)(() => {
		reload();
	}, [reload]);
	return {
		...state,
		reload
	};
}
var KEY = "alejka-recent";
var LIMIT = 8;
function loadRecent() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isRecentItem).slice(0, LIMIT);
	} catch {
		return [];
	}
}
function isRecentItem(value) {
	if (!value || typeof value !== "object") return false;
	const item = value;
	return typeof item.code === "string" && typeof item.name === "string" && typeof item.at === "number";
}
function pushRecent(item) {
	const next = [{
		...item,
		at: Date.now()
	}, ...loadRecent().filter((entry) => entry.code !== item.code)].slice(0, LIMIT);
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
	return next;
}
function beep(frequencies, durationSec) {
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	if (!AudioCtx) return;
	try {
		const ctx = new AudioCtx();
		const now = ctx.currentTime;
		frequencies.forEach((freq, index) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "square";
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(1e-4, now);
			const start = now + index * (durationSec * .55);
			gain.gain.exponentialRampToValueAtTime(.05, start + .01);
			gain.gain.exponentialRampToValueAtTime(1e-4, start + durationSec);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(start);
			osc.stop(start + durationSec + .02);
		});
		window.setTimeout(() => {
			ctx.close();
		}, 400);
	} catch {}
}
function vibrate(pattern) {
	try {
		const activation = navigator.userActivation;
		if (!activation || !(activation.isActive || activation.hasBeenActive)) return;
		navigator.vibrate?.(pattern);
	} catch {}
}
function signalFound() {
	vibrate([
		28,
		36,
		48
	]);
	beep([880, 1174], .09);
}
function signalMiss() {
	vibrate([90]);
	beep([196], .14);
}
var EXAMPLE_CODE = "5901861002712";
function Home() {
	const { kod, widok } = Route$1.useSearch();
	const { photoUrl } = Route$1.useLoaderData();
	const navigate = Route$1.useNavigate();
	const catalog = useProductCatalog();
	const [draft, setDraft] = (0, import_react.useState)(kod ?? "");
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const signaled = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		setRecent(loadRecent());
	}, []);
	(0, import_react.useEffect)(() => {
		setDraft(kod ?? "");
	}, [kod]);
	const product = kod ? findProduct(kod, catalog.products) ?? null : null;
	const lookedUp = Boolean(kod) && catalog.status === "ready";
	(0, import_react.useEffect)(() => {
		if (!lookedUp || !kod) return;
		if (signaled.current === kod) return;
		signaled.current = kod;
		const found = findProduct(kod, catalog.products);
		if (found) {
			signalFound();
			setRecent(pushRecent({
				code: found.barcode || found.articleNumber,
				name: found.name
			}));
		} else signalMiss();
	}, [
		lookedUp,
		kod,
		catalog.products
	]);
	const go = (next) => {
		navigate({
			to: "/",
			search: next
		});
	};
	const lookup = (raw) => {
		const code = normalizeCode(raw);
		if (!code) return;
		setScanning(false);
		go({
			kod: code,
			widok: "skaner"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl leading-none tracking-tight",
					children: "Alejka"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Skaner lokalizacji towaru"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [catalog.status === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "muted",
						children: [catalog.products.length, " szt."]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => void catalog.reload(),
						"aria-label": "Odśwież bazę towarów",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn(catalog.status === "loading" && "animate-spin") })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 px-4 pb-28",
				children: widok === "baza" ? catalog.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					message: catalog.error,
					onRetry: () => void catalog.reload()
				}) : catalog.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Wczytuję bazę…"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogView, {
					products: catalog.products,
					onPick: (code) => lookup(code)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [lookedUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductResult, {
						product,
						query: kod ?? "",
						photoUrl,
						onScanAgain: () => setScanning(true)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							lookup(draft);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft,
							onChange: (event) => setDraft(event.target.value),
							inputMode: "numeric",
							autoComplete: "off",
							enterKeyHint: "search",
							placeholder: "Inny kod lub nr artykułu",
							"aria-label": "Kod kreskowy lub numer artykułu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "secondary",
							children: "Szukaj"
						})]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							className: "w-full font-display text-xl tracking-tight",
							onClick: () => setScanning(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-5" }), "Skanuj kod kreskowy"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex gap-2",
							onSubmit: (event) => {
								event.preventDefault();
								lookup(draft);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft,
								onChange: (event) => setDraft(event.target.value),
								inputMode: "numeric",
								autoComplete: "off",
								enterKeyHint: "search",
								placeholder: "Wpisz kod lub nr artykułu",
								"aria-label": "Kod kreskowy lub numer artykułu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "secondary",
								children: "Szukaj"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => lookup(EXAMPLE_CODE),
								className: "rounded-sm border border-border bg-secondary px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground",
								children: ["Przykład: ", EXAMPLE_CODE]
							})
						}),
						catalog.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
							message: catalog.error,
							onRetry: () => void catalog.reload()
						}) : catalog.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Wczytuję bazę…"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyHint, {})
					] }), recent.length > 0 && !lookedUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
						children: "Ostatnie skany"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "overflow-hidden rounded-lg border border-border",
						children: recent.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => lookup(item.code),
							className: "flex w-full items-center justify-between gap-3 bg-card px-3 py-3 text-left hover:bg-secondary",
							style: index > 0 ? { borderTop: "1px solid var(--color-border)" } : void 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tabular-nums text-muted-foreground",
								children: item.code
							})]
						}) }, `${item.code}-${item.at}`))
					})] }) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-lg grid-cols-2 p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: widok !== "baza",
						onClick: () => go({
							kod,
							widok: "skaner"
						}),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanBarcode, {}),
						label: "Skaner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: widok === "baza",
						onClick: () => go({
							kod,
							widok: "baza"
						}),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {}),
						label: "Baza"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScannerOverlay, {
				open: scanning,
				onClose: () => setScanning(false),
				onDetect: (code) => lookup(code)
			})
		]
	});
}
function TabButton({ active, onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-12 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "[&_svg]:size-4",
			children: icon
		}), label]
	});
}
function EmptyHint() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-dashed border-border bg-card/60 px-5 py-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanBarcode, { className: "mx-auto size-8 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-2xl tracking-tight",
				children: "Gotowy do skanu"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-xs text-sm leading-normal text-muted-foreground",
				children: "Zeskanuj kod aparatem albo wpisz numer. Po odczycie zobaczysz alejkę, regał, półkę i pozycję od lewej."
			})
		]
	});
}
function ErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-normal text-muted-foreground",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "secondary",
			onClick: onRetry,
			children: "Spróbuj ponownie"
		})]
	});
}
//#endregion
export { Home as component };
