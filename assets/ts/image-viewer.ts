import { elements, requiredElement } from "./dom";

interface ImageItem {
  source: string;
  alt: string;
  caption?: DocumentFragment;
}

// One native dialog serves both standalone images and every gallery on the page
const viewer = document.createElement("dialog");
viewer.className = "image-viewer";
viewer.setAttribute("aria-labelledby", "image-viewer-title");

const icon = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${path}"/></svg>`;

viewer.innerHTML = `
  <div class="image-viewer__surface">
    <header class="image-viewer__toolbar">
      <span id="image-viewer-title"></span>
      <span class="image-viewer__count" aria-live="polite"></span>
      <button class="image-viewer__control image-viewer__close" type="button" aria-label="Close image viewer" autofocus>${icon("M6 6l12 12M18 6L6 18")}</button>
    </header>
    <div class="image-viewer__stage">
      <button class="image-viewer__control image-viewer__previous" type="button" aria-label="Previous image">${icon("M14 5l-7 7 7 7")}</button>
      <img class="image-viewer__image" alt="">
      <button class="image-viewer__control image-viewer__next" type="button" aria-label="Next image">${icon("M10 5l7 7-7 7")}</button>
    </div>
    <div class="image-viewer__caption"></div>
  </div>`;
document.body.append(viewer);

const image = requiredElement<HTMLImageElement>(".image-viewer__image", viewer);
const caption = requiredElement(".image-viewer__caption", viewer);
const count = requiredElement(".image-viewer__count", viewer);
const previous = requiredElement<HTMLButtonElement>(
  ".image-viewer__previous",
  viewer,
);
const next = requiredElement<HTMLButtonElement>(".image-viewer__next", viewer);

let items: ImageItem[] = [];
let active = 0;
let opener: HTMLElement | null = null;
let gallery: HTMLElement | null = null;

function show(index: number) {
  active = (index + items.length) % items.length;

  const item = items[active];

  image.src = item.source;
  image.alt = item.alt;
  caption.replaceChildren(
    item.caption?.cloneNode(true) ?? document.createTextNode(""),
  );
  caption.hidden = !caption.textContent?.trim();
  previous.hidden = next.hidden = items.length < 2;
  count.textContent = items.length > 1 ? `${active + 1} / ${items.length}` : "";
}

function open(
  images: ImageItem[],
  index: number,
  trigger: HTMLElement,
  title: string,
  group: HTMLElement | null = null,
) {
  items = images;
  opener = trigger;
  gallery = group;
  requiredElement("#image-viewer-title", viewer).textContent = title;
  show(index);
  gallery?.dispatchEvent(new CustomEvent("gallerychange", { detail: active }));
  viewer.showModal();
  document.documentElement.classList.add("image-viewer-open");
}

// Keep the inline slideshow on the image chosen in the full-size viewer
function move(direction: number) {
  show(active + direction);
  gallery?.dispatchEvent(new CustomEvent("gallerychange", { detail: active }));
}

previous.addEventListener("click", () => move(-1));
next.addEventListener("click", () => move(1));
requiredElement(".image-viewer__close", viewer).addEventListener("click", () =>
  viewer.close(),
);

viewer.addEventListener("click", (event) => {
  if (event.target === viewer) {
    viewer.close();
  }
});

viewer.addEventListener("keydown", (event) => {
  // Leave arrow keys alone when a caption link or other interactive content is focused
  if (
    event.target instanceof Element &&
    event.target.closest(".image-viewer__caption")
  ) {
    return;
  }

  if (
    items.length > 1 &&
    (event.key === "ArrowLeft" || event.key === "ArrowRight")
  ) {
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }
});

viewer.addEventListener("close", () => {
  document.documentElement.classList.remove("image-viewer-open");
  image.removeAttribute("src");
  caption.replaceChildren();

  // Return keyboard focus to the current image, which may differ from the opener
  const returnTarget = gallery
    ? elements<HTMLButtonElement>(".carousel-fullsize", gallery)[active]
    : opener;

  returnTarget?.focus({ preventScroll: true });
  items = [];
});

elements(".carousel").forEach((carousel) => {
  const buttons = elements<HTMLButtonElement>(".carousel-fullsize", carousel);

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const images = buttons.map((entry) => ({
        source: entry.dataset.fullsize || "",
        alt: entry.dataset.alt || "",
        caption:
          entry.querySelector<HTMLTemplateElement>("template.desc")?.content,
      }));

      open(
        images,
        index,
        button,
        carousel.dataset.galleryTitle || "Image gallery",
        carousel,
      );
    });
  });
});

elements<HTMLImageElement>(".project-prose img, img.project-pic").forEach(
  (thumbnail) => {
    if (thumbnail.closest("a, .carousel, button")) {
      return;
    }

    thumbnail.classList.add("image-viewer-trigger");
    thumbnail.tabIndex = 0;
    thumbnail.setAttribute("role", "button");
    thumbnail.setAttribute(
      "aria-label",
      thumbnail.alt ? `View image: ${thumbnail.alt}` : "View image full size",
    );

    const activate = () => {
      const description = thumbnail
        .closest("div.project-pic")
        ?.querySelector(".project-pic-desc-caption");
      const fragment = document.createDocumentFragment();

      if (description) {
        fragment.append(
          ...Array.from(description.childNodes, (node) => node.cloneNode(true)),
        );
      }

      open(
        [
          {
            source:
              thumbnail.dataset.fullsize ||
              thumbnail.currentSrc ||
              thumbnail.src,
            alt: thumbnail.alt,
            caption: fragment,
          },
        ],
        0,
        thumbnail,
        "Image detail",
      );
    };

    thumbnail.addEventListener("click", activate);

    thumbnail.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  },
);
