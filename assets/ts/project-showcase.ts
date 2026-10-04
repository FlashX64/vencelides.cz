import { requiredElement, elements } from "./dom";

(() => {
  elements(".project-showcase", document).forEach((root) => {
    const feature = requiredElement(".project-feature", root);
    const slides = elements("[data-feature-slide]", feature);
    const dots = elements("[data-feature-index]", feature);

    let active = 0;

    const showFeature = (index: number) => {
      active = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const selected = i === active;

        slide.classList.toggle("is-active", selected);
        slide.toggleAttribute("inert", !selected);
        slide.setAttribute("aria-hidden", String(!selected));
        dots[i].setAttribute("aria-current", String(selected));
      });

      requiredElement(".project-feature-status", feature).textContent =
        `${active + 1} / ${slides.length}`;
    };

    if (slides.length) {
      showFeature(0);
      feature.classList.add("is-ready");
      requiredElement(".project-feature-controls", feature).hidden =
        slides.length < 2;

      elements("[data-feature-step]", feature).forEach((button) => {
        button.addEventListener("click", () => {
          showFeature(active + Number(button.dataset.featureStep));
        });
      });

      dots.forEach((button, index) => {
        button.addEventListener("click", () => {
          showFeature(index);
        });
      });

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (slides.length > 1 && !reducedMotion.matches) {
        const autoplayTimer = window.setInterval(() => {
          if (
            !document.hidden &&
            !reducedMotion.matches &&
            !feature.matches(":hover, :focus-within")
          ) {
            showFeature(active + 1);
          }
        }, 5000);

        // After the visitor takes control, keep their chosen project on screen
        const stopAutoplay = () => window.clearInterval(autoplayTimer);

        feature.addEventListener("pointerdown", stopAutoplay, {
          capture: true,
        });
        feature.addEventListener("focusin", stopAutoplay);
        feature.addEventListener("click", stopAutoplay);
      }
    }

    const tablist = requiredElement(".project-category-tabs", root);
    const tabs = elements("[role=tab]", tablist);
    const panels = elements(".project-category-panel", root);
    const updates: (() => void)[] = [];

    panels.forEach((panel) => {
      const track = requiredElement(".project-category-track", panel);
      const cards = elements<HTMLElement>(":scope > *", track);
      const previous = requiredElement<HTMLButtonElement>(
        "[data-card-step='-1']",
        panel,
      );
      const next = requiredElement<HTMLButtonElement>(
        "[data-card-step='1']",
        panel,
      );

      const update = () => {
        if (!panel.classList.contains("is-active") || !cards.length) {
          return;
        }

        // Include the 12px CSS gap and allow 2px for fractional scroll rounding
        const step = cards[0].offsetWidth + 12;
        const first = Math.floor((track.scrollLeft + 2) / step) + 1;
        const last = Math.min(
          Math.ceil((track.scrollLeft + track.clientWidth - 2) / step),
          cards.length,
        );
        const range = first === last ? first : `${first}–${last}`;

        requiredElement(".project-card-status", panel).textContent =
          `Projects ${range} of ${cards.length}`;
        previous.disabled = track.scrollLeft < 2;
        next.disabled =
          track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      };

      const move = (direction: number) => {
        track.scrollBy({
          left: direction * (cards[0].offsetWidth + 12),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      };

      previous.addEventListener("click", () => {
        move(-1);
      });

      next.addEventListener("click", () => {
        move(1);
      });

      track.addEventListener("scroll", update, { passive: true });

      track.addEventListener("keydown", (event) => {
        if (
          event.target === track &&
          (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ) {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      });

      requiredElement(".project-card-navigation", panel).hidden = false;
      new ResizeObserver(update).observe(track);
      updates.push(update);
    });

    const selectCategory = (index: number) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;

        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].classList.toggle("is-active", selected);
        panels[i].toggleAttribute("inert", !selected);
        panels[i].setAttribute("aria-hidden", String(!selected));
        panels[i].setAttribute("role", "tabpanel");
        panels[i].setAttribute("aria-labelledby", tab.id);
      });

      updates[index]();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        selectCategory(index);
      });

      tab.addEventListener("keydown", (event) => {
        let target = index;

        if (event.key === "ArrowRight") {
          target = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          target = (index + tabs.length - 1) % tabs.length;
        } else if (event.key === "Home") {
          target = 0;
        } else if (event.key === "End") {
          target = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        selectCategory(target);
        tabs[target].focus();
        tabs[target].scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    });

    tablist.hidden = false;
    requiredElement(".project-category-panels", root).classList.add("is-ready");
    selectCategory(0);
  });
})();
