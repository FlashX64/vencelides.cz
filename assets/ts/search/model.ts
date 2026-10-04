import Fuse from "fuse.js";

export interface SearchPage {
  title: string;
  permalink: string;
  contents: string;
  image: string;
  tags: string[];
  categories: string[];
}

function terms(value: unknown): string[] {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readIndex(value: unknown): SearchPage[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid search index");
  }

  return value.map((entry) => {
    if (
      !entry ||
      typeof entry.title !== "string" ||
      typeof entry.contents !== "string" ||
      typeof entry.permalink !== "string"
    ) {
      throw new Error("Invalid search page");
    }

    return {
      title: entry.title,
      contents: entry.contents,
      permalink: entry.permalink || "/",
      image: typeof entry.image === "string" ? entry.image : "",
      tags: terms(entry.tags),
      categories: terms(entry.categories),
    };
  });
}

export function createSearch(pages: SearchPage[]) {
  const index = new Fuse(pages, {
    // Match exact text anywhere in an article, even far beyond its opening paragraph
    threshold: 0,
    ignoreLocation: true,
    minMatchCharLength: 1,
    keys: [
      { name: "title", weight: 0.9 },
      { name: "contents", weight: 0.5 },
      { name: "tags", weight: 0.3 },
      { name: "categories", weight: 0.3 },
    ],
  });

  return (query: string): SearchPage[] =>
    index.search(query).map(({ item }) => item);
}

export function excerpt(contents: string, query: string): string {
  const text = contents.replace(/\s+/g, " ").trim();
  const term = query.replace(/\s+/g, " ").trim();
  const position = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  const from = position < 0 ? 0 : Math.max(0, position - 60);
  const until = position < 0 ? 120 : position + term.length + 60;
  // Expand the excerpt to word boundaries so its edges do not cut words in half
  const start = from - (text.slice(0, from).match(/\S*$/)?.[0].length ?? 0);
  const end = Math.min(
    text.length,
    until + (text.slice(until).match(/^\S*/)?.[0].length ?? 0),
  );

  return `${start ? "\u2026 " : ""}${text.slice(start, end).trim()}${end < text.length ? " \u2026" : ""}`;
}

// A stable first match keeps surviving cards in place; new matches go at the end
export function orderResults(
  previous: string[],
  incoming: SearchPage[],
): SearchPage[] {
  if (!incoming.length || previous[0] !== incoming[0].permalink) {
    return incoming;
  }

  const remaining = new Map(incoming.map((page) => [page.permalink, page]));
  const ordered: SearchPage[] = [];

  for (const key of previous) {
    const page = remaining.get(key);

    if (page) {
      ordered.push(page);
      remaining.delete(key);
    }
  }

  return [...ordered, ...remaining.values()];
}
