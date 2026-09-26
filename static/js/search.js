const summaryInclude = 60;

function sanitizeHtml(value) {
  if (
    typeof DOMPurify !== "undefined" &&
    DOMPurify &&
    typeof DOMPurify.sanitize === "function"
  ) {
    return DOMPurify.sanitize(value);
  }

  const fallbackContainer = document.createElement("div");
  fallbackContainer.textContent = value || "";
  return fallbackContainer.innerHTML;
}

const fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.0,
  // Match text anywhere in a title or content field, not only at its beginning.
  ignoreLocation: true,
  tokenize: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: "title", weight: 0.9 },
    { name: "contents", weight: 0.5 },
    { name: "tags", weight: 0.3 },
    { name: "categories", weight: 0.3 },
  ],
};

// Display error message in the search results container
function displayError(message) {
  const searchResultsElement = document.getElementById("search-results");
  if (searchResultsElement) {
    delete searchResultsElement.dataset.resultSignature;
    const resolvedMessage =
      message ||
      getSearchMessage(
        "errorGeneric",
        "There was a problem with search. Please try again later.",
      );
    const sanitizedMessage = sanitizeHtml(resolvedMessage);
    searchResultsElement.innerHTML = `<div class="alert alert-danger">${sanitizedMessage}</div>`;
  } else {
    console.error("Search results container not found");
  }
}

// Safely get DOM element with error handling
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID '${id}' not found`);
  }
  return element;
}

// Read translated search messages from the page when available.
function getSearchMessage(key, fallback) {
  if (
    typeof window !== "undefined" &&
    window.SEARCH_I18N &&
    window.SEARCH_I18N.messages &&
    window.SEARCH_I18N.messages[key]
  ) {
    return window.SEARCH_I18N.messages[key];
  }
  return fallback;
}

function getIndexUrl(searchResults) {
  if (searchResults && searchResults.dataset && searchResults.dataset.indexUrl) {
    return searchResults.dataset.indexUrl;
  }

  const formWithIndex = document.querySelector("form[data-index-url]");
  if (formWithIndex && formWithIndex.dataset.indexUrl) {
    return formWithIndex.dataset.indexUrl;
  }

  const dataIndexElement = document.querySelector("[data-search-index-url]");
  if (dataIndexElement && dataIndexElement.dataset.searchIndexUrl) {
    return dataIndexElement.dataset.searchIndexUrl;
  }

  return "/index.json";
}

// Debounce function to prevent excessive search calls
function debounce(func, wait) {
  let timeout;
  const debounced = function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

// Function to update URL with search query
function updateURL(query) {
  try {
    // Create a URL object from the current URL
    const url = new URL(window.location.href);

    if (query && query.length >= 2) {
      // Set or update the 's' parameter
      url.searchParams.set("s", query);
    } else {
      // Remove the 's' parameter if query is empty or too short
      url.searchParams.delete("s");
    }

    // Update the URL without reloading the page
    window.history.replaceState({}, "", url.toString());
  } catch (error) {
    console.error("Error updating URL:", error);
    // Continue without URL update - non-critical error
  }
}

// Safe parameter extraction with error handling
function param(name) {
  try {
    const paramValue = (location.search.split(`${name}=`)[1] || "").split("&")[0];
    return paramValue ? decodeURIComponent(paramValue).replace(/\+/g, " ") : "";
  } catch (error) {
    console.error(`Error parsing URL parameter '${name}':`, error);
    return "";
  }
}

// Get search query from URL parameter
const searchQuery = param("s");
try {
  const searchInput = getElement("search-query");
  const searchResults = getElement("search-results");

  if (searchInput && searchQuery) {
    searchInput.value = searchQuery;
    executeSearch(searchQuery);
  } else if (searchResults) {
    searchResults.innerHTML =
      `<div class='alert'>${getSearchMessage(
        "minChars",
        "Please enter at least 2 characters to search",
      )}</div>`;
  }
} catch (error) {
  console.error("Error initializing search:", error);
  displayError(
    getSearchMessage(
      "errorGeneric",
      "There was a problem with search. Please try again later.",
    ),
  );
}

// Add event listener for real-time searching
document.addEventListener("DOMContentLoaded", () => {
  try {
    const searchInput = getElement("search-query");
    if (!searchInput) {
      throw new Error("Search input not found");
    }

    const runSearch = (query) => {
      // Update URL with current search query
      updateURL(query);

      const searchResults = getElement("search-results");
      if (!searchResults) {
        throw new Error("Search results container not found");
      }

      if (query.length >= 2) {
        executeSearch(query);
      } else if (query.length === 0 || query.length === 1) {
        delete searchResults.dataset.resultSignature;
        searchResults.innerHTML =
          `<div class='alert'>${getSearchMessage(
            "minChars",
            "Please enter at least 2 characters to search",
          )}</div>`;
      }
    };

    // Wait for a pause in typing so normal pauses between keys do not redraw results.
    const debouncedSearch = debounce(runSearch, 600);

    // Set up input event for real-time searching
    searchInput.addEventListener("input", function () {
      const query = this.value.trim();
      if (query.length < 2) {
        debouncedSearch.cancel();
        runSearch(query);
      } else {
        debouncedSearch(query);
      }
    });

    // Handle form submission to prevent page reload
    const searchForm = searchInput.closest("form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        debouncedSearch.cancel();
        runSearch(query);
      });
    }
  } catch (error) {
    console.error("Error setting up search event listeners:", error);
    displayError(
      getSearchMessage(
        "errorGeneric",
        "There was a problem with search. Please try again later.",
      ),
    );
  }
});

function executeSearch(searchQuery) {
  let loadingTimer;
  try {
    if (!searchQuery || typeof searchQuery !== "string") {
      throw new Error("Invalid search query");
    }

    const searchResults = getElement("search-results");
    if (!searchResults) {
      throw new Error("Search results container not found");
    }

    // Keep existing results visible during fast searches to avoid a flashing spinner.
    // Only show loading feedback when the request takes noticeably longer.
    loadingTimer = setTimeout(() => {
      if (getElement("search-query").value.trim() !== searchQuery) return;
      // Preserve an existing result list even during a slower follow-up search.
      if (searchResults.dataset.resultSignature !== undefined) return;
      searchResults.innerHTML =
        `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">${getSearchMessage(
          "loading",
          "Loading...",
        )}</span></div>`;
    }, 200);

    const indexUrl = getIndexUrl(searchResults);
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`,
          );
        }
        return response.json();
      })
      .then((data) => {
        // A response for an older query must not replace results after more typing
        // or repopulate the list after the input has been cleared.
        if (getElement("search-query").value.trim() !== searchQuery) return;
        if (!Array.isArray(data)) {
          throw new Error("Received invalid data format from server");
        }

        const pages = data;
        const result = performSearch(pages, searchQuery);

        updateSearchResults(result, searchResults, searchQuery);
      })
      .catch((error) => {
        if (getElement("search-query").value.trim() !== searchQuery) return;
        console.error("Error executing search:", error);
        displayError();
      })
      .finally(() => {
        clearTimeout(loadingTimer);
      });
  } catch (error) {
    clearTimeout(loadingTimer);
    console.error("Error in search execution:", error);
    displayError();
  }
}

function updateSearchResults(result, searchResults, query) {
  const previous = JSON.parse(searchResults.dataset.resultSignature || "[]");
  const identity = (item) => item.permalink || item.title;
  const sameFirst = previous.length > 0 && result.length > 0 &&
    identity(previous[0]) === identity(result[0].item);

  // Keep surviving entries in their displayed order and append new matches.
  // A different top match signals a new list, so let the entire list fade in.
  const incoming = new Map(result.map((entry) => [identity(entry.item), entry]));
  const retained = sameFirst
    ? previous.filter((item) => incoming.has(identity(item)))
    : [];
  const retainedIds = new Set(retained.map(identity));
  const added = result.filter((entry) => !retainedIds.has(identity(entry.item)));
  const ordered = [...retained.map((item) => incoming.get(identity(item))), ...added];
  const signature = JSON.stringify(ordered.map(({ item }) => item));
  if (searchResults.dataset.resultSignature === signature) {
    ordered.forEach(({ item }, index) => {
      updateResultPreview(searchResults.children[index], item, query);
    });
    return;
  }

  if (sameFirst) {
    const elements = Array.from(searchResults.children);
    let index = 0;
    previous.forEach((item, oldIndex) => {
      const element = elements[oldIndex];
      if (retainedIds.has(identity(item))) {
        element.id = `summary-${index++}`;
        updateResultPreview(element, incoming.get(identity(item)).item, query);
      } else {
        element.remove();
      }
    });
  } else {
    searchResults.innerHTML = "";
  }

  if (ordered.length > 0) {
    populateResults(added, retained.length, query);
  } else {
    searchResults.insertAdjacentHTML(
      "beforeend",
      `<div class='alert search-result-enter'>${getSearchMessage(
        "noMatches",
        "No matches found",
      )}</div>`,
    );
  }
  searchResults.dataset.resultSignature = signature;
}

function performSearch(pages, searchQuery) {
  if (typeof Fuse === "function") {
    try {
      const fuse = new Fuse(pages, fuseOptions);
      return fuse.search(searchQuery);
    } catch (error) {
      console.error(
        "Error using Fuse for search, falling back to basic in-memory search:",
        error,
      );
      // Intentionally fall through to the in-memory search implementation below
    }
  }

  const normalizedQuery = searchQuery.toLowerCase();
  const searchableKeys = ["title", "contents", "tags", "categories"];

  return pages
    .filter((page) =>
      searchableKeys.some((key) => {
        const value = page && page[key];
        if (Array.isArray(value)) {
          return value.some(
            (entry) =>
              typeof entry === "string" &&
              entry.toLowerCase().includes(normalizedQuery),
          );
        }
        return (
          typeof value === "string" && value.toLowerCase().includes(normalizedQuery)
        );
      }),
    )
    .map((item) => ({ item }));
}

function searchExcerpt(contents, query) {
  const text = (contents || "").replace(/\s+/g, " ").trim();
  const term = query.replace(/\s+/g, " ").trim();
  const match = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  let start = match < 0 ? 0 : Math.max(0, match - summaryInclude);
  let end = match < 0
    ? Math.min(text.length, summaryInclude * 2)
    : Math.min(text.length, match + term.length + summaryInclude);

  // Extend to word boundaries, and show where the passage has been trimmed.
  while (start > 0 && !/\s/.test(text[start - 1])) start--;
  while (end < text.length && !/\s/.test(text[end])) end++;
  return (start > 0 ? "… " : "") + text.slice(start, end).trim() +
    (end < text.length ? " …" : "");
}

function highlightSearchText(element, text, query) {
  if (!element) return;
  const term = query.replace(/\s+/g, " ").trim();
  // Avoid touching retained cards when both their preview and highlight are unchanged.
  const signature = JSON.stringify([text, term.toLowerCase()]);
  if (element.dataset.highlightSignature === signature) return;
  const fragment = document.createDocumentFragment();
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let offset = 0;
  let match = term ? lowerText.indexOf(lowerTerm) : -1;
  while (match !== -1) {
    fragment.append(document.createTextNode(text.slice(offset, match)));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(match, match + term.length);
    fragment.append(mark);
    offset = match + term.length;
    match = lowerText.indexOf(lowerTerm, offset);
  }
  fragment.append(document.createTextNode(text.slice(offset)));
  element.replaceChildren(fragment);
  element.dataset.highlightSignature = signature;
}

function updateResultPreview(element, item, query) {
  if (!element) return;
  highlightSearchText(element.querySelector("p"),
    searchExcerpt(item.contents, query) || getSearchMessage("noPreview", "No preview available"), query);
  highlightSearchText(element.querySelector("h4 a"),
    item.title || getSearchMessage("untitled", "Untitled"), query);
}

function populateResults(result, startIndex = 0, query = "") {
  try {
    if (!Array.isArray(result)) {
      throw new Error("Invalid search results");
    }

    const searchResults = getElement("search-results");
    if (!searchResults) {
      throw new Error("Search results container not found");
    }

    const templateElement = document.getElementById("search-result-template");
    if (!templateElement) {
      throw new Error("Search result template not found");
    }
    const templateDefinition = templateElement.innerHTML;

    for (const [index, value] of result.entries()) {
      const key = startIndex + index;
      if (!value || !value.item) {
        console.warn("Skipping invalid search result item", value);
        continue;
      }

      const snippet = ""; // Filled safely as text after the card is inserted.

      try {
        // Insert the templated result
        const tags = value.item.tags || "";
        const categories = value.item.categories || "";
        const output = render(templateDefinition, {
          key: key,
          title: value.item.title || getSearchMessage("untitled", "Untitled"),
          link: value.item.permalink || "#",
          tags: Array.isArray(tags) ? tags.join(',') : tags,
          categories: Array.isArray(categories) ? categories.join(',') : categories,
          snippet: snippet || getSearchMessage("noPreview", "No preview available"),
        });
        searchResults.insertAdjacentHTML("beforeend", output);
        
        // Add tags/categories as clickable badges
        const resultElement = document.getElementById(`summary-${key}`);
        if (resultElement) {
          resultElement.classList.add("search-result-enter");
          resultElement.addEventListener("animationend", () => {
            resultElement.classList.remove("search-result-enter");
          }, { once: true });
        }
        if (resultElement && typeof addTagsToResult === 'function') {
          addTagsToResult(resultElement);
        }

        updateResultPreview(resultElement, value.item, query);
      } catch (error) {
        console.error("Error rendering search result:", error);
      }
    }
  } catch (error) {
    console.error("Error populating results:", error);
    displayError(
      getSearchMessage(
        "errorGeneric",
        "There was a problem with search. Please try again later.",
      ),
    );
  }
}

function render(templateString, data) {
  try {
    if (!templateString || !data) {
      throw new Error("Invalid template or data");
    }

    let conditionalMatches, conditionalPattern, copy;
    conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;

    // Since loop below depends on re.lastIndex, we use a copy to capture any manipulations
    copy = templateString;

    while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
      if (conditionalMatches.length < 3) continue;

      if (data[conditionalMatches[1]]) {
        // Valid key, remove conditionals, leave contents
        copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
      } else {
        // Not valid, remove entire section
        copy = copy.replace(conditionalMatches[0], "");
      }
    }

    let result = copy;

    // Now any conditionals removed we can do simple substitution
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value !== undefined && value !== null) {
          const find = `\\$\\{\\s*${key}\\s*\\}`;
          const re = new RegExp(find, "g");
          result = result.replace(re, value);
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error rendering template:", error);
    return `<div class="alert alert-danger">${getSearchMessage(
      "errorGeneric",
      "There was a problem with search. Please try again later.",
    )}</div>`;
  }
}
