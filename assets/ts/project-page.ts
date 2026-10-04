import { requiredElement, elements } from "./dom";

document.addEventListener("DOMContentLoaded", function () {
  const outline = document.querySelector<HTMLElement>(".project-outline");

  if (!outline) {
    return;
  }

  const links = elements<HTMLAnchorElement>("a[href^='#']", outline);
  const sections = links.map(function (link) {
    return document.getElementById(decodeURIComponent(link.hash.slice(1)));
  });

  let scheduled = false;

  function updateSection() {
    scheduled = false;

    let active = 0;

    sections.forEach(function (section, index) {
      if (section && section.getBoundingClientRect().top <= 160) {
        active = index;
      }
    });

    links.forEach(function (link, index) {
      if (index === active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function scheduleUpdate() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateSection);
    }
  }

  const details = requiredElement<HTMLDetailsElement>("details", outline);
  const mobile = window.matchMedia("(max-width: 900px)");

  function updateLayout() {
    details.open = !mobile.matches;
  }

  mobile.addEventListener("change", updateLayout);

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobile.matches) {
        details.open = false;
      }
    });
  });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  updateLayout();
  updateSection();
});
