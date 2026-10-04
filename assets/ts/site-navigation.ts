import Collapse from "bootstrap/js/dist/collapse";

const header = document.querySelector<HTMLElement>(".header");
const menu = document.getElementById("navbarSupportedContent");
const links = [
  ...document.querySelectorAll<HTMLAnchorElement>(".header .nav-link"),
];

if (header && menu) {
  const sections = links.flatMap((link) => {
    const url = new URL(link.href);
    const section =
      url.pathname === location.pathname && url.hash
        ? document.getElementById(url.hash.slice(1))
        : null;

    return section ? [{ link, section }] : [];
  });

  const closeMenu = () => {
    if (menu.classList.contains("show")) {
      // The menu and full-height mobile header are separate Bootstrap collapses
      Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
      Collapse.getOrCreateInstance(header, { toggle: false }).hide();
    }
  };

  links.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("show")) {
      closeMenu();
      header.querySelector<HTMLButtonElement>(".navbar-toggler")?.focus();
    }
  });

  let scheduled = false;

  const update = () => {
    header.classList.toggle("header--sticky-triggered", window.scrollY > 15);

    const threshold = header.getBoundingClientRect().bottom + 60;

    sections.forEach(({ link, section }) => {
      const bounds = section.getBoundingClientRect();

      if (bounds.top <= threshold && bounds.bottom > threshold) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    scheduled = false;
  };

  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", schedule, { passive: true });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
      closeMenu();
    }

    schedule();
  });

  update();
}
