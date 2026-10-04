import { elements, requiredElement } from "./dom";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

elements(".carousel").forEach((carousel) => {
  const track = requiredElement(".carousel-track", carousel);
  const slides = elements("ul li", carousel);
  const bullets = elements("ol li", carousel);
  const captions = elements(".carousel-caption-item", carousel);
  const fullsizeButtons = elements<HTMLButtonElement>(
    ".carousel-fullsize",
    carousel,
  );

  if (!slides.length) {
    return;
  }

  const previous = requiredElement<HTMLButtonElement>(
    ".carousel-previous",
    carousel,
  );
  const next = requiredElement<HTMLButtonElement>(".carousel-next", carousel);

  let active = 0;
  let captionIndex = -1;
  let interacted = false;
  let autoplayTimer: number | undefined;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let scheduled = false;

  const stopAutoplay = () => {
    interacted = true;
    window.clearInterval(autoplayTimer);
  };

  // Touch, mouse, and keyboard users take control until the page is reloaded
  carousel.addEventListener("pointerdown", stopAutoplay, { capture: true });
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("click", stopAutoplay);

  const wrap = (index: number) => (index + slides.length) % slides.length;

  const update = () => {
    active = Math.min(
      slides.length - 1,
      Math.max(0, Math.round(track.scrollLeft / track.clientWidth)),
    );
    slides.forEach((slide, index) =>
      slide.classList.toggle("selected", index === active),
    );
    bullets.forEach((bullet, index) =>
      bullet.classList.toggle("selected", index === active),
    );

    // Hidden captions still reserve height, but must not accept keyboard focus
    if (captionIndex !== active) {
      captions.forEach((caption, index) => {
        caption.classList.toggle("is-active", index === active);
        caption.setAttribute("aria-hidden", String(index !== active));
        caption.inert = index !== active;
      });

      captionIndex = active;
    }

    scheduled = false;
  };

  // Combine repeated scroll events into one update per animation frame
  const scheduleUpdate = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };

  const goTo = (index: number) => {
    stopAutoplay();

    const target = wrap(index);

    track.scrollTo({
      left: target * track.clientWidth,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  };

  previous.addEventListener("click", () => goTo(active - 1));
  next.addEventListener("click", () => goTo(active + 1));

  bullets.forEach((bullet, index) => {
    requiredElement<HTMLAnchorElement>("a", bullet).addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        goTo(index);
      },
    );
  });

  track.addEventListener("scroll", scheduleUpdate, { passive: true });
  track.addEventListener("touchstart", stopAutoplay, { passive: true });

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });

  track.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }

    dragging = true;
    stopAutoplay();
    startX = event.pageX;
    startScroll = track.scrollLeft;
    track.classList.add("grabbing");
  });

  const stopDrag = () => {
    dragging = false;
    track.classList.remove("grabbing");
    scheduleUpdate();
  };

  track.addEventListener("mouseup", stopDrag);
  track.addEventListener("mouseleave", stopDrag);

  track.addEventListener("mousemove", (event) => {
    if (dragging) {
      event.preventDefault();
      track.scrollLeft = startScroll - (event.pageX - startX);
    }
  });

  // Opening an image should not also begin dragging the slideshow
  fullsizeButtons.forEach((button) => {
    button.addEventListener("mousedown", (event) => event.stopPropagation());
    button.addEventListener("touchstart", (event) => event.stopPropagation(), {
      passive: true,
    });
  });

  carousel.addEventListener("gallerychange", (event) => {
    goTo((event as CustomEvent<number>).detail);
  });

  const duration = Number(carousel.getAttribute("duration"));

  if (duration > 0 && slides.length > 1 && !reducedMotion.matches) {
    autoplayTimer = window.setInterval(() => {
      if (
        !interacted &&
        !reducedMotion.matches &&
        !carousel.matches(":hover") &&
        !document.hidden
      ) {
        const target = wrap(active + 1);

        track.scrollTo({
          left: target * track.clientWidth,
          behavior: "smooth",
        });
      }
    }, duration);
  }

  new ResizeObserver(scheduleUpdate).observe(track);
  update();
});
