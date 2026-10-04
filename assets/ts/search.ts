import { requiredElement } from "./dom";
import { createSearch, readIndex } from "./search/model";
import { SearchView } from "./search/view";

const form = requiredElement<HTMLFormElement>("form[data-search]");
const input = requiredElement<HTMLInputElement>("#search-query", form);
const results = requiredElement("#search-results");
const status = requiredElement("#search-status");
const view = new SearchView(
  results,
  requiredElement<HTMLTemplateElement>("#search-result-template"),
  JSON.parse(form.dataset.tagNames || "{}"),
);

let search: Promise<ReturnType<typeof createSearch>> | undefined;
let debounceTimer: number | undefined;
let loadingTimer: number | undefined;
let revision = 0;

function loadSearch(): Promise<ReturnType<typeof createSearch>> {
  // Share the first download and index across queries, including while it is still loading
  search ??= fetch(form.dataset.indexUrl!)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Search index request failed: ${response.status}`);
      }

      return createSearch(readIndex(await response.json()));
    })
    .catch((error) => {
      // Allow a later search to retry a failed download
      search = undefined;
      throw error;
    });

  return search;
}

async function run(query: string, request: number): Promise<void> {
  const url = new URL(location.href);

  if (query.length >= 2) {
    url.searchParams.set("s", query);
  } else {
    url.searchParams.delete("s");
  }

  // Keep the query shareable without adding a history entry for each edit
  history.replaceState(null, "", url);

  if (query.length < 2) {
    const hint = "Please enter at least 2 characters to search";

    view.message(hint);
    status.textContent = hint;

    return;
  }

  results.setAttribute("aria-busy", "true");
  // Avoid a loading flash on fast searches and keep existing results visible
  loadingTimer = window.setTimeout(() => {
    if (request === revision && !view.hasResults) {
      view.message("Loading...");
      status.textContent = "Loading search results";
    }
  }, 200);

  try {
    const find = await loadSearch();

    if (request !== revision) {
      return;
    }

    const pages = find(query);

    view.render(pages, query);
    status.textContent = pages.length
      ? `${pages.length} matching ${pages.length === 1 ? "page" : "pages"}`
      : "No matches found";
  } catch (error) {
    if (request === revision) {
      console.error("Search failed", error);

      const message =
        "There was a problem with search. Please try again later.";

      view.message(message);
      status.textContent = message;
    }
  } finally {
    if (request === revision) {
      window.clearTimeout(loadingTimer);
      results.setAttribute("aria-busy", "false");
    }
  }
}

function schedule(immediate = false): void {
  // Invalidate older work as soon as typing starts, before the debounce finishes
  const request = ++revision;

  window.clearTimeout(debounceTimer);
  window.clearTimeout(loadingTimer);
  results.setAttribute("aria-busy", "false");

  const query = input.value.trim();

  if (immediate || query.length < 2) {
    void run(query, request);
  } else {
    debounceTimer = window.setTimeout(() => void run(query, request), 600);
  }
}

input.addEventListener("input", () => schedule());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  schedule(true);
});

results.addEventListener("click", (event) => {
  // Preserve normal browser actions such as opening a filter in another tab
  if (
    !(event.target instanceof Element) ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return;
  }

  const badge = event.target.closest<HTMLAnchorElement>("[data-search-filter]");

  if (badge) {
    event.preventDefault();
    input.value = badge.dataset.searchFilter!;
    schedule(true);
  }
});

function readQuery(): void {
  input.value = new URLSearchParams(location.search).get("s") ?? "";
  schedule(true);
}

window.addEventListener("popstate", readQuery);
readQuery();
