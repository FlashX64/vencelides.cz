import {
  applyTheme,
  loadTheme,
  preferredTheme,
  saveTheme,
  type Theme,
} from "./theme";

const buttons = document.querySelectorAll<HTMLButtonElement>(
  "[data-theme-toggle]",
);

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const next: Theme =
      document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark";

    saveTheme(next);
    applyTheme(next);
  });
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (preferredTheme() === "auto") {
    applyTheme("auto");
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === "theme" || event.key === null) {
    // A changed or cleared preference in another tab applies here too
    applyTheme(loadTheme());
  }
});
