import { requiredElement } from "../dom";
import { excerpt, orderResults, type SearchPage } from "./model";

function highlight(element: HTMLElement, text: string, query: string): void {
  const term = query.replace(/\s+/g, " ").trim();
  const signature = JSON.stringify([text, term.toLowerCase()]);

  if (element.dataset.highlight === signature) {
    return;
  }

  // Treat the query as literal text, including characters such as + or (
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = term ? text.split(new RegExp(`(${escaped})`, "gi")) : [text];

  // Build text nodes so article content cannot be interpreted as HTML
  element.replaceChildren(
    ...parts.map((part, index) => {
      if (index % 2 === 0) {
        return document.createTextNode(part);
      }

      const mark = document.createElement("mark");
      mark.textContent = part;

      return mark;
    }),
  );
  element.dataset.highlight = signature;
}

function safeURL(value: string): URL | null {
  try {
    const url = new URL(value, location.href);

    return ["http:", "https:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

export class SearchView {
  private cards = new Map<string, HTMLElement>();

  constructor(
    private container: HTMLElement,
    private template: HTMLTemplateElement,
    private tagNames: Record<string, string>,
  ) {}

  get hasResults(): boolean {
    return this.cards.size > 0;
  }

  message(text: string): void {
    this.cards.clear();

    const notice = document.createElement("div");
    notice.className = "alert";
    notice.textContent = text;
    this.container.replaceChildren(notice);
  }

  render(pages: SearchPage[], query: string): void {
    const ordered = orderResults([...this.cards.keys()], pages);

    if (!ordered.length) {
      this.message("No matches found");

      return;
    }

    // Reuse cards to avoid replaying their fade unless the first result changes
    const keep = ordered[0].permalink === this.cards.keys().next().value;

    if (!keep) {
      this.cards.clear();
      this.container.replaceChildren();
    }

    const matches = new Set(ordered.map((page) => page.permalink));

    for (const [key, card] of this.cards) {
      if (!matches.has(key)) {
        card.remove();
        this.cards.delete(key);
      }
    }

    for (const page of ordered) {
      let card = this.cards.get(page.permalink);

      if (!card) {
        card = this.createCard(page);
        this.cards.set(page.permalink, card);
        this.container.append(card);
      }

      highlight(requiredElement("h4 a", card), page.title || "Untitled", query);
      highlight(
        requiredElement(".search-result-excerpt", card),
        excerpt(page.contents, query) || "No preview available",
        query,
      );
    }
  }

  private createCard(page: SearchPage): HTMLElement {
    const fragment = this.template.content.cloneNode(true) as DocumentFragment;
    const card = requiredElement(".search-result", fragment);
    const link = requiredElement<HTMLAnchorElement>("h4 a", card);

    link.href = safeURL(page.permalink)?.href ?? "/";

    const imageURL = page.image ? safeURL(page.image) : null;

    if (imageURL?.origin === location.origin) {
      const image = document.createElement("img");
      image.className = "search-result-image";
      image.src = imageURL.href;
      image.alt = "";
      image.loading = "lazy";
      card.prepend(image);
      card.style.setProperty(
        "--project-image",
        `url(${JSON.stringify(imageURL.href)})`,
      );
    }

    const copy = requiredElement(".search-result-copy", card);

    this.addFilters(copy, page.categories, "category");
    this.addFilters(copy, page.tags, "tag");
    card.classList.add("search-result-enter");
    card.addEventListener(
      "animationend",
      () => card.classList.remove("search-result-enter"),
      { once: true },
    );

    return card;
  }

  private addFilters(
    copy: HTMLElement,
    values: string[],
    kind: "tag" | "category",
  ): void {
    if (!values.length) {
      return;
    }

    const group = document.createElement("div");
    group.className = "search-result-taxonomy";

    const label = document.createElement("span");
    label.className = "search-result-taxonomy-label";
    label.textContent = kind === "tag" ? "Tags: " : "Categories: ";
    group.append(label);

    for (const value of values) {
      const badge = document.createElement("a");
      const name =
        kind === "tag" && Object.hasOwn(this.tagNames, value)
          ? this.tagNames[value]
          : value;
      const url = new URL(location.pathname, location.origin);

      url.searchParams.set("s", value);
      badge.href = url.href;
      badge.className = "tag-badge";
      badge.dataset.searchFilter = value;
      badge.textContent = name;
      badge.setAttribute(
        "aria-label",
        `Filter search results by ${kind}: ${name}`,
      );
      group.append(badge);
    }

    copy.append(group);
  }
}
