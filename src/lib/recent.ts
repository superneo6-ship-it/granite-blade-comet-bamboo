const KEY = "alejka-recent";
const LIMIT = 8;

export type RecentItem = {
  code: string;
  name: string;
  at: number;
};

export function loadRecent(): RecentItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentItem).slice(0, LIMIT);
  } catch {
    return [];
  }
}

function isRecentItem(value: unknown): value is RecentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as RecentItem;
  return (
    typeof item.code === "string" &&
    typeof item.name === "string" &&
    typeof item.at === "number"
  );
}

export function pushRecent(item: Omit<RecentItem, "at">): RecentItem[] {
  const next: RecentItem[] = [
    { ...item, at: Date.now() },
    ...loadRecent().filter((entry) => entry.code !== item.code),
  ].slice(0, LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}
